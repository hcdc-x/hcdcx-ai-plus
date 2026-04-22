import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'providers/auth_provider.dart';
import 'providers/code_provider.dart';
import 'providers/scan_provider.dart';
import 'services/socket_service.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/scanner_screen.dart';
import 'screens/analytics_screen.dart';
import 'screens/generator_screen.dart';
import 'screens/code_detail_screen.dart';
import 'themes/app_theme.dart';
import 'utils/routes.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  await Firebase.initializeApp();

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.black,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const HCDCXApp());
}

class HCDCXApp extends StatelessWidget {
  const HCDCXApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CodeProvider()),
        ChangeNotifierProvider(create: (_) => ScanProvider()),
        Provider(create: (_) => SocketService()),
      ],
      child: MaterialApp(
        title: 'HCDC-X AI+',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.dark,
        initialRoute: Routes.splash,
        routes: {
          Routes.splash: (_) => const SplashScreen(),
          Routes.login: (_) => const LoginScreen(),
          Routes.dashboard: (_) => const DashboardScreen(),
          Routes.scanner: (_) => const ScannerScreen(),
          Routes.analytics: (_) => const AnalyticsScreen(),
          Routes.generator: (_) => const GeneratorScreen(),
          Routes.codeDetail: (_) => const CodeDetailScreen(),
        },
        builder: (context, child) {
          FlutterNativeSplash.remove();
          return child!;
        },
      ),
    );
  }
}
