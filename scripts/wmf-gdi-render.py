# -*- coding: utf-8 -*-
"""Windows GDI 原生渲染 WMF → 高清 PNG（与 Word 同一渲染引擎）
用法: python wmf-gdi-render.py <input.wmf> <output.png> [dpi]
说明: render_wmf_gdi 默认按「主字号归一」输出（所有公式图统一字号，观感一致）。
"""
import ctypes
import struct
import sys
import numpy as np
from ctypes import wintypes as wt

# 公式图统一目标主字号（px）：与题干正文 15px 文字和谐（docx 中公式与正文同字号）
# 注意：此为"字符全高"（数字/字母含上下伸展），与 15px 汉字视觉相当
TARGET_MAIN_FONT = 15
# 几何图（坐标系/图形）不走字号归一，回退按宽度缩放
GEOM_MAX_W = 700

class BITMAPINFOHEADER(ctypes.Structure):
    _fields_ = [
        ("biSize", wt.DWORD), ("biWidth", wt.LONG), ("biHeight", wt.LONG),
        ("biPlanes", wt.WORD), ("biBitCount", wt.WORD), ("biCompression", wt.DWORD),
        ("biSizeImage", wt.DWORD), ("biXPelsPerMeter", wt.LONG), ("biYPelsPerMeter", wt.LONG),
        ("biClrUsed", wt.DWORD), ("biClrImportant", wt.DWORD),
    ]

gdi32 = ctypes.WinDLL("gdi32", use_last_error=True)
user32 = ctypes.WinDLL("user32", use_last_error=True)

# 句柄返回函数必须显式设置 restype，避免 64 位截断
user32.GetDC.restype = wt.HDC
user32.GetDC.argtypes = [wt.HWND]
user32.ReleaseDC.restype = ctypes.c_int
user32.ReleaseDC.argtypes = [wt.HWND, wt.HDC]
gdi32.CreateCompatibleDC.restype = wt.HDC
gdi32.CreateCompatibleDC.argtypes = [wt.HDC]
gdi32.CreateDIBSection.restype = wt.HBITMAP
gdi32.CreateDIBSection.argtypes = [wt.HDC, ctypes.POINTER(BITMAPINFOHEADER), ctypes.c_uint,
                                   ctypes.POINTER(ctypes.c_void_p), wt.HANDLE, wt.DWORD]
gdi32.SetMetaFileBitsEx.restype = wt.HMETAFILE
gdi32.SetMetaFileBitsEx.argtypes = [ctypes.c_uint, ctypes.c_char_p]
gdi32.PlayMetaFile.restype = wt.BOOL
gdi32.PlayMetaFile.argtypes = [wt.HDC, wt.HMETAFILE]
gdi32.SelectObject.restype = wt.HANDLE
gdi32.SelectObject.argtypes = [wt.HDC, wt.HANDLE]
gdi32.DeleteObject.restype = wt.BOOL
gdi32.DeleteObject.argtypes = [wt.HANDLE]
gdi32.DeleteDC.restype = wt.BOOL
gdi32.DeleteDC.argtypes = [wt.HDC]
gdi32.SetMapMode.restype = ctypes.c_int
gdi32.DeleteMetaFile.restype = wt.BOOL
gdi32.DeleteMetaFile.argtypes = [wt.HMETAFILE]
gdi32.SetMapMode.argtypes = [wt.HDC, ctypes.c_int]
gdi32.SetBkMode.restype = ctypes.c_int
gdi32.SetBkMode.argtypes = [wt.HDC, ctypes.c_int]
gdi32.PatBlt.restype = wt.BOOL
gdi32.PatBlt.argtypes = [wt.HDC, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int, wt.DWORD]
gdi32.SetWindowOrgEx.argtypes = [wt.HDC, ctypes.c_int, ctypes.c_int, ctypes.c_void_p]
gdi32.SetWindowExtEx.argtypes = [wt.HDC, ctypes.c_int, ctypes.c_int, ctypes.c_void_p]
gdi32.SetViewportOrgEx.argtypes = [wt.HDC, ctypes.c_int, ctypes.c_int, ctypes.c_void_p]
gdi32.SetViewportExtEx.argtypes = [wt.HDC, ctypes.c_int, ctypes.c_int, ctypes.c_void_p]



def _main_font_height(img):
    """连通域分析估计主字号（px）。
    返回 (主字号p75, 字符域数, 最大字符高度, 黑像素填充率, 方块大域数, 总域数)
    - 主字号：字符连通域高度的 p75（同一文档稳定）
    - fill：黑像素占比（区分空心图形与粗符号的关键）
    - square_doms：被当图形的「方块整图级大域」数
    """
    try:
        from scipy import ndimage
    except Exception:
        return None, 0, 0, 0.0, 0, 0
    gray = np.array(img.convert("L"))
    w, h = gray.shape[1], gray.shape[0]
    if w < 8 or h < 8:
        return None, 0, 0, 0.0, 0, 0
    bw = gray < 160
    fill = float(bw.sum()) / (w * h)
    lab, n = ndimage.label(bw)
    hs = []
    max_h = 0
    square_doms = 0
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        ch = ys.max() - ys.min() + 1
        cw = xs.max() - xs.min() + 1
        # 方块状整图级大域（w/h>=0.8）：可能是 Venn 圆等图形，也可能是粗体单符号
        # （∪/∩/∅/粗字母）——先剔除统计，由调用方按填充率二次判断
        if ch > h * 0.95 and cw > w * 0.7 and w / h >= 0.8:
            square_doms += 1
            continue
        if ch < 8:
            continue  # 噪声
        if cw > w * 0.7 and ch <= 3:
            continue  # 分数线 / 根号横线
        hs.append(ch)
        max_h = max(max_h, ch)
    if not hs:
        return None, 0, 0, fill, square_doms, n
    p75 = float(np.percentile(hs, 75))
    return p75, len(hs), max_h, fill, square_doms, n


def render_wmf_gdi(wmf_bytes, dpi=300, scale=3):
    """把 WMF 字节渲染为 PIL Image（白底，高清）。
    关键：MathType WMF 内部自带 SetMapMode/SetViewportExt 记录，播放时会覆盖外部缩放映射，
    因此 DIB 必须按 WMF bbox 原始逻辑尺寸 1:1 创建，渲染完再做归一化。
    - 公式图：按主字号统一缩放（TARGET_MAIN_FONT），保证所有公式字体大小一致
    - 几何图：按宽度上限缩放（GEOM_MAX_W），保持图形比例
    失败返回 None"""
    if not wmf_bytes or wmf_bytes[:4] != b"\xd7\xcd\xc6\x9a":
        return None
    x1, y1, x2, y2 = struct.unpack("<hhhh", wmf_bytes[6:14])
    w_log = x2 - x1
    h_log = y2 - y1
    if w_log <= 0 or h_log <= 0:
        return None
    # DIB = bbox 原始逻辑尺寸（1:1，避免被 WMF 内部映射覆盖导致裁剪白图）
    target_w = max(1, min(w_log, 4000))
    target_h = max(1, min(h_log, 4000))

    hdc_screen = user32.GetDC(None)
    hdc = gdi32.CreateCompatibleDC(hdc_screen)
    user32.ReleaseDC(None, hdc_screen)
    if not hdc:
        return None
    try:
        bi = BITMAPINFOHEADER()
        bi.biSize = ctypes.sizeof(BITMAPINFOHEADER)
        bi.biWidth = target_w
        bi.biHeight = -target_h  # 负值 = 自顶向下
        bi.biPlanes = 1
        bi.biBitCount = 32
        bi.biCompression = 0  # BI_RGB
        bits = ctypes.c_void_p()
        hbmp = gdi32.CreateDIBSection(hdc, ctypes.byref(bi), 0, ctypes.byref(bits), None, 0)
        if not hbmp:
            return None
        old = gdi32.SelectObject(hdc, hbmp)
        # 白底
        gdi32.PatBlt(hdc, 0, 0, target_w, target_h, 0x00FFFFFF)  # WHITENESS
        gdi32.SetBkMode(hdc, 1)  # OPAQUE
        # SetMetaFileBitsEx 需要标准 WMF（无 22 字节 Placeable 头）
        hMF = gdi32.SetMetaFileBitsEx(len(wmf_bytes) - 22, wmf_bytes[22:])
        if not hMF:
            gdi32.SelectObject(hdc, old)
            gdi32.DeleteObject(hbmp)
            return None
        # 关键：不要设置外部映射（保持默认 MM_TEXT）。
        # WMF 内部记录自带映射（如 SetViewportExt 1152x640），PlayMetaFile 播放时会覆盖外部设置；
        # DIB 用 bbox 原始逻辑尺寸 1:1，正好与 WMF 内部画布一致。
        gdi32.PlayMetaFile(hdc, hMF)
        gdi32.DeleteMetaFile(hMF)
        # 读像素
        buf = ctypes.string_at(bits, target_w * target_h * 4)
        from PIL import Image
        img = Image.frombuffer("RGBA", (target_w, target_h), buf, "raw", "BGRA", 0, 1)
        img = img.convert("RGB")
        # 阈值裁剪白边（忽略浅灰抗锯齿残留）
        gray = img.convert("L")
        mask = gray.point(lambda v: 255 if v < 248 else 0)
        bbox = mask.getbbox()
        if bbox:
            img = img.crop(bbox)
        # 归一化：公式/字符图按主字号统一；粗体单符号（方块、高填充）按高度统一；
        # 纯图形（空心/细线/多元素）按宽度上限
        main_h, n_comp, max_h, fill, square_doms, n_dom = _main_font_height(img)
        if main_h and main_h > 8:
            # 公式/多字符：缩放到统一主字号
            ratio = TARGET_MAIN_FONT / main_h
            ratio = min(max(ratio, 0.03), 4.0)  # 防极端
            img = img.resize(
                (max(1, int(img.width * ratio)), max(1, int(img.height * ratio))),
                Image.LANCZOS,
            )
        elif fill >= 0.18 and n_dom <= 10:
            # 方块状粗体单符号/字母（∪、∩、∅、⊂、粗体字母等）：字符占满裁剪框，
            # 无正常字符域可测——按图高缩放到主字号（2026-08-20 踩坑：曾被当图形原样输出）
            ratio = TARGET_MAIN_FONT / max(img.height, 1)
            ratio = min(max(ratio, 0.03), 4.0)
            img = img.resize(
                (max(1, int(img.width * ratio)), max(1, int(img.height * ratio))),
                Image.LANCZOS,
            )
        else:
            # 图形（空心 Venn 圆/坐标系/多元素）：按宽度上限缩放
            if img.width > GEOM_MAX_W:
                img = img.resize(
                    (GEOM_MAX_W, max(1, int(img.height * GEOM_MAX_W / img.width))),
                    Image.LANCZOS,
                )
        gdi32.SelectObject(hdc, old)
        gdi32.DeleteObject(hbmp)
        return img
    finally:
        gdi32.DeleteDC(hdc)


if __name__ == "__main__":
    src = sys.argv[1]
    dst = sys.argv[2]
    dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 300
    data = open(src, "rb").read()
    img = render_wmf_gdi(data, dpi)
    if img is None:
        print("渲染失败")
        sys.exit(1)
    img.save(dst, "PNG")
    print(f"OK {dst} {img.size[0]}x{img.size[1]} @ {dpi}dpi")
