import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/scan_provider.dart';
import '../services/api_service.dart';
import '../widgets/glass_card.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  String _selectedRange = 'week';
  Map<String, dynamic>? _analyticsData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.getAnalytics(range: _selectedRange);
      setState(() {
        _analyticsData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load analytics: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black.withOpacity(0.8),
        title: const Text('Analytics'),
        actions: [
          DropdownButton<String>(
            value: _selectedRange,
            dropdownColor: const Color(0xFF1A1A2E),
            iconEnabledColor: const Color(0xFF00FFFF),
            items: const [
              DropdownMenuItem(value: 'day', child: Text('Day')),
              DropdownMenuItem(value: 'week', child: Text('Week')),
              DropdownMenuItem(value: 'month', child: Text('Month')),
            ],
            onChanged: (value) {
              if (value != null) {
                setState(() => _selectedRange = value);
                _loadAnalytics();
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _analyticsData == null
              ? const Center(child: Text('No data available'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _buildSummaryCards(),
                      const SizedBox(height: 24),
                      _buildScanTrendChart(),
                      const SizedBox(height: 24),
                      _buildDeviceDistribution(),
                      const SizedBox(height: 24),
                      _buildRiskDistribution(),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSummaryCards() {
    final summary = _analyticsData!['summary'] ?? {};
    
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _StatCard(
          title: 'Total Scans',
          value: '${summary['totalScans'] ?? 0}',
          icon: Icons.qr_code_scanner,
          color: const Color(0xFF00FFFF),
        ),
        _StatCard(
          title: 'Avg Risk Score',
          value: '${(summary['avgRiskScore'] ?? 0).toStringAsFixed(1)}',
          icon: Icons.security,
          color: const Color(0xFF0080FF),
        ),
        _StatCard(
          title: 'Blocked',
          value: '${summary['blockedScans'] ?? 0}',
          icon: Icons.block,
          color: Colors.red,
        ),
        _StatCard(
          title: 'Active Codes',
          value: '${summary['activeCodes'] ?? 0}',
          icon: Icons.qr_code,
          color: const Color(0xFFA020F0),
        ),
      ],
    );
  }

  Widget _buildScanTrendChart() {
    final scansByDay = _analyticsData!['scansByDay'] as List? ?? [];
    
    if (scansByDay.isEmpty) {
      return GlassCard(
        padding: const EdgeInsets.all(16),
        child: const Center(
          child: Text('No scan trend data available'),
        ),
      );
    }

    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Scan Trends',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 200,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: Colors.white.withOpacity(0.1),
                    strokeWidth: 1,
                  ),
                ),
                titlesData: FlTitlesData(
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) => Text(
                        value.toInt().toString(),
                        style: const TextStyle(color: Colors.white54, fontSize: 10),
                      ),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 30,
                      getTitlesWidget: (value, meta) {
                        if (value.toInt() >= scansByDay.length) return const SizedBox();
                        final date = scansByDay[value.toInt()]['date'] as String? ?? '';
                        return Text(
                          date.substring(5),
                          style: const TextStyle(color: Colors.white54, fontSize: 10),
                        );
                      },
                    ),
                  ),
                  rightTitles: const AxisTitles(),
                  topTitles: const AxisTitles(),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: scansByDay.asMap().entries.map((e) {
                      return FlSpot(e.key.toDouble(), (e.value['scans'] ?? 0).toDouble());
                    }).toList(),
                    color: const Color(0xFF00FFFF),
                    barWidth: 3,
                    isCurved: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      color: const Color(0xFF00FFFF).withOpacity(0.1),
                    ),
                  ),
                ],
                minY: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceDistribution() {
    final devices = _analyticsData!['deviceDistribution'] as List? ?? [];
    
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Device Distribution',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          ...devices.map((device) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Text(
                    device['device'] ?? 'Unknown',
                    style: const TextStyle(color: Colors.white70),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    '${device['count']} scans',
                    style: const TextStyle(color: Color(0xFF00FFFF)),
                    textAlign: TextAlign.end,
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildRiskDistribution() {
    final riskData = _analyticsData!['riskDistribution'] as List? ?? [];
    
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Risk Distribution',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 200,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: riskData.fold<double>(0, (max, item) => 
                  (item['count'] as num).toDouble() > max ? (item['count'] as num).toDouble() : max) + 5,
                barTouchData: BarTouchData(enabled: true),
                titlesData: FlTitlesData(
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) => Text(
                        value.toInt().toString(),
                        style: const TextStyle(color: Colors.white54, fontSize: 10),
                      ),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index >= riskData.length) return const SizedBox();
                        final range = riskData[index]['range'] as String? ?? '';
                        return Text(
                          range,
                          style: const TextStyle(color: Colors.white54, fontSize: 9),
                        );
                      },
                    ),
                  ),
                  rightTitles: const AxisTitles(),
                  topTitles: const AxisTitles(),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: Colors.white.withOpacity(0.1),
                    strokeWidth: 1,
                  ),
                ),
                borderData: FlBorderData(show: false),
                barGroups: riskData.asMap().entries.map((e) {
                  final count = (e.value['count'] as num).toDouble();
                  final range = e.value['range'] as String? ?? '';
                  
                  Color barColor;
                  if (range.contains('80') || range.contains('100')) {
                    barColor = Colors.red;
                  } else if (range.contains('40') || range.contains('60')) {
                    barColor = Colors.orange;
                  } else {
                    barColor = const Color(0xFF00FFFF);
                  }
                  
                  return BarChartGroupData(
                    x: e.key,
                    barRods: [
                      BarChartRodData(
                        toY: count,
                        color: barColor,
                        width: 20,
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
