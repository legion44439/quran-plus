import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_exception.dart';
import '../data/auth_repository.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  String? _validatePassword(String password) {
    if (password.length < 8) return 'password_rule'.tr();
    final hasLetter = RegExp(r'[A-Za-z]').hasMatch(password);
    final hasDigit = RegExp(r'\d').hasMatch(password);
    if (!hasLetter || !hasDigit) return 'password_rule'.tr();
    return null;
  }

  Future<void> _submit() async {
    final pwdError = _validatePassword(_password.text);
    if (pwdError != null) {
      setState(() => _error = pwdError);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(pwdError)),
      );
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authStateProvider.notifier).register(
            _name.text.trim(),
            _email.text.trim(),
            _password.text,
          );
      if (mounted) context.go('/home');
    } catch (e) {
      final msg = e is ApiException ? e.message : apiErrorMessage(e);
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
      appBar: AppBar(title: Text('register_title'.tr())),
      body: SingleChildScrollView(
        padding: const EdgeInsetsDirectional.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _name,
              decoration: InputDecoration(
                labelText: 'register_name'.tr(),
                border: const OutlineInputBorder(),
              ),
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
            const SizedBox(height: 16),
            TextField(
              controller: _password,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'login_password'.tr(),
                helperText: 'password_rule'.tr(),
                border: const OutlineInputBorder(),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text('register_submit'.tr()),
            ),
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
