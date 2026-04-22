FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖 (OpenCV 需要)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件并安装
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY app.py .
COPY examples ./examples

# 暴露 Gradio 默认端口
EXPOSE 7860

# 启动命令
CMD ["python", "app.py"]
