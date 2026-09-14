import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_exception.dart';
import '../data/auth_repository.dart';

/// Forgot / reset password UI wired to NestJS:
/// POST /auth/forgot-password {email}, POST /auth/reset-password {token, newPassword}.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _email = TextEditingController();
  final _token = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  bool _showReset = false;
  String? _info;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _token.dispose();
    _password.dispose();
    super.dispose();
  }

  String _friendly(Object e) {
    if (e is ApiException) return e.message;
    return apiErrorMessage(e);
  }

  Future<void> _requestReset() async {
    final email = _email.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'login_email'.tr());
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
      _info = null;
    });
    try {
      final result =
          await ref.read(authStateProvider.notifier).forgotPassword(email);
      if (mounted) {
        setState(() {
          _info = result.message.isNotEmpty
              ? result.message
              : 'forgot_sent'.tr();
          _showReset = true;
          if (result.resetToken != null && result.resetToken!.isNotEmpty) {
            _token.text = result.resetToken!;
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_info!)),
        );
      }
    } catch (e) {
      final msg = _friendly(e);
      if (mounted) {
        setState(() => _error = msg);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _reset() async {
    final token = _token.text.trim();
    final password = _password.text;
    if (token.isEmpty || password.length < 8) {
      setState(() => _error = 'password_rule'.tr());
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authStateProvider.notifier).resetPassword(
            token: token,
            password: password,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('forgot_reset_ok'.tr())),
        );
        context.go('/login');
      }
    } catch (e) {
      final msg = _friendly(e);
      if (mounted) {
        setState(() => _error = msg);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('forgot_title'.tr())),
      body: SingleChildScrollView(
        padding: const EdgeInsetsDirectional.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'forgot_body'.tr(),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              autocorrect: false,
              decoration: InputDecoration(
                labelText: 'login_email'.tr(),
                border: const OutlineInputBorder(),
              ),
            ),
            if (_info != null) ...[
              const SizedBox(height: 12),
              Text(
                _info!,
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _loading ? null : _requestReset,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text('forgot_submit'.tr()),
            ),
            if (_showReset) ...[
              const SizedBox(height: 32),
              Text(
                'forgot_reset_title'.tr(),
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _token,
                decoration: InputDecoration(
                  labelText: 'forgot_token'.tr(),
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _password,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'login_password'.tr(),
                  helperText: 'password_rule'.tr(),
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: _loading ? null : _reset,
                child: Text('forgot_reset_submit'.tr()),
              ),
            ],
            TextButton(
              onPressed: () => context.pop(),
              child: Text('register_to_login'.tr()),
            ),
          ],
        ),
      ),
    );
  }
}
