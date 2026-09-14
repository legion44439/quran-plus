import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/empty_state.dart';
import '../../quran/data/quran_repository.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  bool _loading = false;
  bool _searched = false;
  List<SearchHit> _hits = const [];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _runSearch(String query) async {
    final q = query.trim();
    if (q.isEmpty) {
      setState(() {
        _searched = false;
        _hits = const [];
      });
      return;
    }
    setState(() {
      _loading = true;
      _searched = true;
    });
    try {
      final hits = await ref.read(quranRepositoryProvider).search(q);
      if (mounted) setState(() => _hits = hits);
    } catch (_) {
      if (mounted) setState(() => _hits = const []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _openHit(SearchHit hit) {
    final type = hit.type.toLowerCase();
    if (type.contains('surah')) {
      context.push('/quran/${hit.id}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('search_title'.tr())),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsetsDirectional.all(16),
            child: TextField(
              controller: _controller,
              textInputAction: TextInputAction.search,
              onSubmitted: _runSearch,
              decoration: InputDecoration(
                hintText: 'search_hint'.tr(),
                prefixIcon: const Icon(Icons.search),
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.arrow_forward),
                  onPressed: () => _runSearch(_controller.text),
                ),
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : !_searched
                    ? EmptyState(
                        icon: Icons.search,
                        message: 'search_prompt'.tr(),
                      )
                    : _hits.isEmpty
                        ? EmptyState(
                            icon: Icons.search_off,
                            message: 'search_empty'.tr(),
                          )
                        : ListView.builder(
                            itemCount: _hits.length,
                            itemBuilder: (context, i) {
                              final h = _hits[i];
                              return ListTile(
                                leading: Icon(
                                  h.type.toLowerCase().contains('ayah')
                                      ? Icons.short_text
                                      : Icons.menu_book_outlined,
                                ),
                                title: Text(h.title),
                                subtitle: h.subtitle != null
                                    ? Text(h.subtitle!)
                                    : Text(h.type),
                                onTap: () => _openHit(h),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
