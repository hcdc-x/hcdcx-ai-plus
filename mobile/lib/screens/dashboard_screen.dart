import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../providers/code_provider.dart';
import '../providers/scan_provider.dart';
import '../services/socket_service.dart';
import '../widgets/glass_card.dart';
import '../widgets/neon_button.dart';
import '../widgets/scan_feed_widget.dart';
import '../widgets/risk_gauge.dart';
import '../utils/routes.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
    _setupSocket();
  }

  void _loadData() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CodeProvider>().fetchCodes();
      context.read<ScanProvider>().fetchStats();
    });
  }

  void _setupSocket() {
    final socketService = context.read<SocketService>();
    final authProvider = context.read<AuthProvider>();

    if (authProvider.isAuthenticated && authProvider.token != null) {
      socketService.connect(authProvider.token!);
      socketService.on('scan:new', (data) {
        context.read<ScanProvider>().addNewScan(data);
      });
      socketService.on('security:update', (data) {
        context.read<ScanProvider>().updateSecurityMetrics(data);
      });
    }
  }

  @override
  void dispose() {
    context.read<SocketService>().disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final codeProvider = context.watch<CodeProvider>();
    final scanProvider = context.watch<ScanProvider>();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black.withOpacity(0.8),
        elevation: 0,
        title: ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [Color(0xFF00FFFF), Color(0xFF0080FF)],
          ).createShader(bounds),
          child: Text(
            'Dashboard',
            style: GoogleFonts.spaceMono(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            onPressed: () async {
              await authProvider.logout();
              if (mounted) {
                Navigator.pushReplacementNamed(context, Routes.login);
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await codeProvider.fetchCodes();
          await scanProvider.fetchStats();
        },
        color: const Color(0xFF00FFFF),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome
              Text(
                'Welcome back,',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 14,
                ),
              ),
              Text(
                authProvider.user?.email ?? 'User',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),

              // Stats Cards
              Row(
                children: [
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.qr_code, color: Color(0xFF00FFFF)),
                          const SizedBox(height: 8),
                          Text(
                            '${codeProvider.codes.length}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Active Codes',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.bar_chart, color: Color(0xFF0080FF)),
                          const SizedBox(height: 8),
                          Text(
                            '${scanProvider.totalScans}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Total Scans',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Risk Score
              GlassCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Security Risk Score',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    RiskGauge(score: scanProvider.riskScore.toDouble()),
                    const SizedBox(height: 8),
                    Text(
                      scanProvider.riskScore < 30
                          ? 'Low Risk - Normal activity'
                          : scanProvider.riskScore < 70
                              ? 'Medium Risk - Monitor activity'
                              : 'High Risk - Immediate attention required',
                      style: TextStyle(
                        color: scanProvider.riskScore < 30
                            ? const Color(0xFF00FFFF)
                            : scanProvider.riskScore < 70
                                ? Colors.orange
                                : Colors.red,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Quick Actions
              Row(
                children: [
                  Expanded(
                    child: NeonButton(
                      onPressed: () {
                        Navigator.pushNamed(context, Routes.scanner);
                      },
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.camera_alt, color: Colors.black, size: 18),
                          SizedBox(width: 8),
                          Text('Scan', style: TextStyle(color: Colors.black)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: NeonButton(
                      onPressed: () {
                        Navigator.pushNamed(context, Routes.generator);
                      },
                      variant: NeonButtonVariant.blue,
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add, color: Colors.black, size: 18),
                          SizedBox(width: 8),
                          Text('Generate', style: TextStyle(color: Colors.black)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Live Scan Feed
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Live Scan Feed',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: context.watch<SocketService>().isConnected
                          ? const Color(0xFF00FFFF).withOpacity(0.2)
                          : Colors.red.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: context.watch<SocketService>().isConnected
                                ? const Color(0xFF00FFFF)
                                : Colors.red,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          context.watch<SocketService>().isConnected ? 'LIVE' : 'OFFLINE',
                          style: TextStyle(
                            color: context.watch<SocketService>().isConnected
                                ? const Color(0xFF00FFFF)
                                : Colors.red,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ScanFeedWidget(scans: scanProvider.recentScans),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, Routes.scanner),
        backgroundColor: const Color(0xFF00FFFF),
        child: const Icon(Icons.qr_code_scanner, color: Colors.black),
      ),
    );
  }
}
