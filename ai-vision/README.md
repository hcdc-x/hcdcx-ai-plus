# HCDC-X AI Vision Enhancer

This service provides AI-powered image preprocessing for the HCDC-X AI+ platform. It improves the readability of QR codes, barcodes, and hybrid codes captured under poor lighting or low-resolution conditions.

## Features

- Non-local means denoising
- CLAHE (Contrast Limited Adaptive Histogram Equalization)
- Sharpening filter
- Automatic brightness correction

## Deployment

This service is designed to run on **Hugging Face Spaces** (free tier) or any Docker-compatible environment.

### Deploy on Hugging Face Spaces

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space)
2. Choose **Gradio** as the SDK
3. Upload the following files:
   - `app.py`
   - `requirements.txt`
   - `examples/` (optional sample images)
4. The Space will automatically build and deploy.

### Run Locally

```bash
pip install -r requirements.txt
python app.py
