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
```

Then open `http://localhost:7860` in your browser.

### API Usage (from backend)

The backend can call this service via HTTP POST to the `/api/predict` endpoint (Gradio's default API). Example:

```javascript
const base64Image = fs.readFileSync('code.png', 'base64');
const response = await axios.post(
  'https://hcdc-x-hcdcx-vision.hf.space/api/predict',
  { data: [base64Image] }
);
const enhancedBase64 = response.data.data[0];
```

## Environment Variables

None required. All configuration is in code.

## License

MIT
