import 'package:flutter/material.dart';

class ScanOverlay extends StatelessWidget {
  final bool isScanning;
  final VoidCallback? onScanAgain;

  const ScanOverlay({
    super.key,
    this.isScanning = true,
    this.onScanAgain,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.transparent,
      child: Stack(
        children: [
          // 半透明遮罩
          CustomPaint(
            painter: _ScanOverlayPainter(),
            child: Container(),
          ),
          // 扫描动画
          if (isScanning)
            Positioned.fill(
              child: _ScanAnimation(),
            ),
          // 提示文字
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(30),
                ),
                child: Text(
                  isScanning ? 'Align the code within the frame' : 'Scan paused',
                  style: const TextStyle(color: Colors.white70),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScanOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black54
      ..style = PaintingStyle.fill;

    final scanAreaSize = size.width * 0.7;
    final left = (size.width - scanAreaSize) / 2;
    final top = (size.height - scanAreaSize) / 2;

    // 绘制四个半透明区域
    canvas.drawPath(
      Path.combine(
        PathOperation.difference,
        Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height)),
        Path()..addRect(Rect.fromLTWH(left, top, scanAreaSize, scanAreaSize)),
      ),
      paint,
    );

    // 绘制扫描框边框
    final borderPaint = Paint()
      ..color = const Color(0xFF00FFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;

    canvas.drawRect(
      Rect.fromLTWH(left, top, scanAreaSize, scanAreaSize),
      borderPaint,
    );

    // 角落装饰
    final cornerLength = scanAreaSize * 0.15;
    final cornerPaint = Paint()
      ..color = const Color(0xFF00FFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;

    // 左上角
    canvas.drawLine(Offset(left, top + cornerLength), Offset(left, top), cornerPaint);
    canvas.drawLine(Offset(left, top), Offset(left + cornerLength, top), cornerPaint);
    // 右上角
    canvas.drawLine(Offset(left + scanAreaSize - cornerLength, top), Offset(left + scanAreaSize, top), cornerPaint);
    canvas.drawLine(Offset(left + scanAreaSize, top), Offset(left + scanAreaSize, top + cornerLength), cornerPaint);
    // 左下角
    canvas.drawLine(Offset(left, top + scanAreaSize - cornerLength), Offset(left, top + scanAreaSize), cornerPaint);
    canvas.drawLine(Offset(left, top + scanAreaSize), Offset(left + cornerLength, top + scanAreaSize), cornerPaint);
    // 右下角
    canvas.drawLine(Offset(left + scanAreaSize - cornerLength, top + scanAreaSize), Offset(left + scanAreaSize, top + scanAreaSize), cornerPaint);
    canvas.drawLine(Offset(left + scanAreaSize, top + scanAreaSize), Offset(left + scanAreaSize, top + scanAreaSize - cornerLength), cornerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ScanAnimation extends StatefulWidget {
  @override
  __ScanAnimationState createState() => __ScanAnimationState();
}

class __ScanAnimationState extends State<_ScanAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0, end: 1).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return CustomPaint(
          painter: _ScanLinePainter(_animation.value),
          child: Container(),
        );
      },
    );
  }
}

class _ScanLinePainter extends CustomPainter {
  final double progress;

  _ScanLinePainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final scanAreaSize = size.width * 0.7;
    final left = (size.width - scanAreaSize) / 2;
    final top = (size.height - scanAreaSize) / 2;

    final paint = Paint()
      ..shader = const LinearGradient(
        colors: [Colors.transparent, Color(0xFF00FFFF), Colors.transparent],
        stops: [0.0, 0.5, 1.0],
      ).createShader(Rect.fromLTWH(left, top, scanAreaSize, 20))
      ..style = PaintingStyle.fill;

    final yPos = top + (scanAreaSize * progress);
    canvas.drawRect(Rect.fromLTWH(left, yPos - 1, scanAreaSize, 3), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
