import 'dart:typed_data';
import 'dart:io';
import 'package:flutter/material.dart';

// A 1x1 transparent PNG image data to use as a placeholder or in tests
final Uint8List transparentImageBytes = Uint8List.fromList([
  0x89,
  0x50,
  0x4E,
  0x47,
  0x0D,
  0x0A,
  0x1A,
  0x0A,
  0x00,
  0x00,
  0x00,
  0x0D,
  0x49,
  0x48,
  0x44,
  0x52,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x01,
  0x08,
  0x06,
  0x00,
  0x00,
  0x00,
  0x1F,
  0x15,
  0xC4,
  0x89,
  0x00,
  0x00,
  0x00,
  0x0D,
  0x49,
  0x44,
  0x41,
  0x54,
  0x78,
  0x9C,
  0x63,
  0x00,
  0x01,
  0x00,
  0x00,
  0x05,
  0x00,
  0x01,
  0x0D,
  0x0A,
  0x2D,
  0xB4,
  0x00,
  0x00,
  0x00,
  0x00,
  0x49,
  0x45,
  0x4E,
  0x44,
  0xAE,
  0x42,
  0x60,
  0x82,
]);

/// Returns a safe ImageProvider, using a local transparent image in test environments
/// to prevent HTTP 400 errors during unit/widget testing.
///
/// [cacheWidth]/[cacheHeight] (in physical pixels) make the decoder downsample
/// the source image to that size instead of decoding it at full resolution -
/// the mock avatar URLs point at full-size uploads, and decoding those at
/// native size for a 48-64px thumbnail is what causes list/scroll jank.
ImageProvider getSafeImageProvider(
  String? url, {
  int? cacheWidth,
  int? cacheHeight,
}) {
  if (url == null || url.isEmpty) {
    return MemoryImage(transparentImageBytes);
  }

  bool isTest = false;
  try {
    isTest = Platform.environment.containsKey('FLUTTER_TEST');
  } catch (_) {
    // Platform.environment is not available on web
  }

  final ImageProvider provider = isTest
      ? MemoryImage(transparentImageBytes)
      : NetworkImage(url);

  if (cacheWidth == null && cacheHeight == null) return provider;
  return ResizeImage(provider, width: cacheWidth, height: cacheHeight);
}
