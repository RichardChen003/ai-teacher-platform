# -*- coding: utf-8 -*-
"""Windows GDI 原生渲染 WMF → 高清 PNG（与 Word 同一渲染引擎）
用法: python wmf-gdi-render.py <input.wmf> <output.png> [dpi]
"""
import ctypes
import struct
import sys
from ctypes import wintypes as wt

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



def render_wmf_gdi(wmf_bytes, dpi=300):
    """把 WMF 字节渲染为 PIL Image（高分辨率，白底）。失败返回 None"""
    if not wmf_bytes or wmf_bytes[:4] != b"\xd7\xcd\xc6\x9a":
        return None
    x1, y1, x2, y2 = struct.unpack("<hhhh", wmf_bytes[6:14])
    inch = struct.unpack("<H", wmf_bytes[14:16])[0]
    w_log = x2 - x1
    h_log = y2 - y1
    if w_log <= 0 or h_log <= 0 or inch <= 0:
        return None
    target_w = max(1, round(w_log * dpi / inch))
    target_h = max(1, round(h_log * dpi / inch))
    if target_w > 4000 or target_h > 4000:  # 防呆
        target_w = min(target_w, 4000)
        target_h = min(target_h, 4000)

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
        # 缩放映射：window = WMF 逻辑坐标，viewport = 目标像素
        gdi32.SetMapMode(hdc, 2)  # MM_ANISOTROPIC
        gdi32.SetWindowOrgEx(hdc, x1, y1, None)
        gdi32.SetWindowExtEx(hdc, w_log, h_log, None)
        gdi32.SetViewportOrgEx(hdc, 0, 0, None)
        gdi32.SetViewportExtEx(hdc, target_w, target_h, None)
        gdi32.PlayMetaFile(hdc, hMF)
        gdi32.DeleteMetaFile(hMF)
        # 读像素
        buf = ctypes.string_at(bits, target_w * target_h * 4)
        from PIL import Image
        img = Image.frombuffer("RGBA", (target_w, target_h), buf, "raw", "BGRA", 0, 1)
        img = img.convert("RGB")
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
