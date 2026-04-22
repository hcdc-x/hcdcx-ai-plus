import os
import cv2
import numpy as np
import gradio as gr
from PIL import Image
import base64
from io import BytesIO

# 图像增强核心函数
def enhance_image(image: Image.Image) -> Image.Image:
    """
    对输入图像进行降噪、对比度增强、亮度校正和锐化处理，
    提升后续扫码识别的成功率。
    """
    # 转换为 OpenCV 格式
    img = np.array(image.convert('RGB'))
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # 1. 降噪 (Non-local Means Denoising)
    denoised = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)

    # 2. 转换为灰度图进行对比度拉伸
    gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)

    # 3. 自适应直方图均衡化 (CLAHE) 增强局部对比度
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced_gray = clahe.apply(gray)

    # 4. 恢复为三通道并应用锐化
    enhanced_bgr = cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2BGR)

    # 5. 锐化滤波
    kernel = np.array([[-1, -1, -1],
                       [-1,  9, -1],
                       [-1, -1, -1]])
    sharpened = cv2.filter2D(enhanced_bgr, -1, kernel)

    # 6. 轻微提高亮度
    brightness = 10
    bright = cv2.add(sharpened, np.array([brightness]))

    # 转换回 PIL 格式
    result = cv2.cvtColor(bright, cv2.COLOR_BGR2RGB)
    return Image.fromarray(result)

def enhance_image_base64(base64_str: str) -> str:
    """
    接收 Base64 编码的图像字符串，返回增强后的 Base64 字符串。
    适用于 API 调用。
    """
    # 解码 Base64
    if base64_str.startswith('data:image'):
        base64_str = base64_str.split(',')[1]
    img_bytes = base64.b64decode(base64_str)
    img = Image.open(BytesIO(img_bytes))

    # 增强
    enhanced = enhance_image(img)

    # 编码为 Base64
    buffered = BytesIO()
    enhanced.save(buffered, format="PNG")
    enhanced_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return enhanced_base64

# Gradio 界面
def gradio_interface(image):
    return enhance_image(image)

# 创建 Gradio 应用
demo = gr.Interface(
    fn=gradio_interface,
    inputs=gr.Image(type="pil", label="Upload Scan Image"),
    outputs=gr.Image(type="pil", label="Enhanced Image"),
    title="HCDC-X AI Vision Enhancer",
    description="Upload a blurry or dark image of a QR/Hybrid code to improve scan success rate.",
    examples=[
        ["examples/sample1.jpg"],
        ["examples/sample2.jpg"],
    ],
    allow_flagging="never"
)

# 启动服务
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
