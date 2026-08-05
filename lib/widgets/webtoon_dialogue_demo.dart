import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/npc.dart';
import '../utils/image_utils.dart';

/// Demo of the "dynamic webtoon" concept described in the concept chat: the
/// artwork itself stays a static frame - only the dialogue is animated, via a
/// typewriter reveal and a pop-in speech bubble per line, similar to a visual
/// novel. Not a production feature; just a quick illustration built from real
/// [NPC] story data so it can be felt on-device rather than described.
class WebtoonDialogueDemo extends StatefulWidget {
  final NPC npc;
  final VoidCallback onClose;

  const WebtoonDialogueDemo({
    super.key,
    required this.npc,
    required this.onClose,
  });

  @override
  State<WebtoonDialogueDemo> createState() => _WebtoonDialogueDemoState();
}

class _WebtoonDialogueDemoState extends State<WebtoonDialogueDemo> {
  static const _typingInterval = Duration(milliseconds: 28);

  late final List<String> _lines = _splitIntoLines(widget.npc.story.content);
  int _lineIndex = 0;
  String _displayedText = '';
  Timer? _typeTimer;

  @override
  void initState() {
    super.initState();
    _startTyping();
  }

  @override
  void dispose() {
    _typeTimer?.cancel();
    super.dispose();
  }

  static List<String> _splitIntoLines(String content) {
    final sentenceBreak = RegExp(r'(?<=[.!?…])\s+');
    final lines = content
        .split('\n\n')
        .map((p) => p.trim())
        .where((p) => p.isNotEmpty)
        .expand((p) => p.split(sentenceBreak))
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();
    return lines.isEmpty ? [content] : lines;
  }

  String get _currentLine => _lines[_lineIndex];
  bool get _isLineFullyShown => _displayedText.length >= _currentLine.length;
  bool get _isLastLine => _lineIndex == _lines.length - 1;

  void _startTyping() {
    _typeTimer?.cancel();
    _displayedText = '';
    _typeTimer = Timer.periodic(_typingInterval, (timer) {
      if (_displayedText.length >= _currentLine.length) {
        timer.cancel();
        return;
      }
      setState(() {
        _displayedText = _currentLine.substring(0, _displayedText.length + 1);
      });
    });
  }

  void _onTap() {
    if (!_isLineFullyShown) {
      _typeTimer?.cancel();
      setState(() => _displayedText = _currentLine);
      return;
    }
    if (_isLastLine) {
      widget.onClose();
      return;
    }
    setState(() => _lineIndex++);
    _startTyping();
  }

  @override
  Widget build(BuildContext context) {
    final npc = widget.npc;
    final dpr = MediaQuery.devicePixelRatioOf(context);
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _onTap,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image(
              image: getSafeImageProvider(
                npc.avatarUrl,
                cacheWidth: (size.width * dpr).round(),
                cacheHeight: (size.height * dpr).round(),
              ),
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) =>
                  const ColoredBox(color: Colors.black87),
            ),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.55),
                    Colors.black.withValues(alpha: 0.05),
                    Colors.black.withValues(alpha: 0.05),
                    Colors.black.withValues(alpha: 0.85),
                  ],
                  stops: const [0.0, 0.25, 0.55, 1.0],
                ),
              ),
            ),
            SafeArea(
              child: Column(
                children: [
                  _ProgressBars(
                    total: _lines.length,
                    current: _lineIndex,
                    currentProgress:
                        _displayedText.length / _currentLine.length,
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 8, 0),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            npc.name,
                            style: GoogleFonts.plusJakartaSans(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              shadows: const [
                                Shadow(blurRadius: 4, color: Colors.black54),
                              ],
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: widget.onClose,
                          icon: const Icon(Icons.close, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 260),
                      transitionBuilder: (child, animation) => FadeTransition(
                        opacity: animation,
                        child: ScaleTransition(
                          scale: Tween(
                            begin: 0.92,
                            end: 1.0,
                          ).animate(animation),
                          child: child,
                        ),
                      ),
                      child: _SpeechBubble(
                        key: ValueKey(_lineIndex),
                        role: npc.role,
                        text: _displayedText,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressBars extends StatelessWidget {
  final int total;
  final int current;
  final double currentProgress;

  const _ProgressBars({
    required this.total,
    required this.current,
    required this.currentProgress,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
      child: Row(
        children: List.generate(total, (i) {
          final fill = i < current
              ? 1.0
              : i == current
              ? currentProgress.clamp(0.0, 1.0)
              : 0.0;
          return Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 2),
              height: 3,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
              child: Align(
                alignment: Alignment.centerLeft,
                child: FractionallySizedBox(
                  widthFactor: fill,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _SpeechBubble extends StatelessWidget {
  final String role;
  final String text;

  const _SpeechBubble({super.key, required this.role, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            role.toUpperCase(),
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.0,
              color: Colors.black45,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            text,
            style: GoogleFonts.ebGaramond(
              fontSize: 20,
              height: 1.35,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}
