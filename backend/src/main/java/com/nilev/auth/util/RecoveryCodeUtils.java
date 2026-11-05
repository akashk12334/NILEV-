package com.nilev.auth.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Utility for generating, canonicalizing, and hashing account recovery codes.
 * Format: NLV-XXXX-XXXX-XXXX-XXXX using unambiguous Base32 Crockford characters.
 */
public final class RecoveryCodeUtils {

    private static final String ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    private RecoveryCodeUtils() {
    }

    /**
     * Generates a cryptographically secure random recovery code.
     * E.g. "NLV-7K9M-4X2P-8W3Q-5Y9Z"
     */
    public static String generateCode() {
        StringBuilder sb = new StringBuilder("NLV");
        for (int i = 0; i < 16; i++) {
            if (i % 4 == 0) {
                sb.append('-');
            }
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    /**
     * Canonicalizes user input by stripping punctuation and whitespace,
     * enforcing uppercase, and reformatting into standard NLV-XXXX-XXXX-XXXX-XXXX.
     */
    public static String normalizeCode(String input) {
        if (input == null) return "";
        String cleaned = input.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        if (cleaned.startsWith("NLV")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.length() != 16) {
            return cleaned; // Invalid length will fail hash comparison safely
        }
        return "NLV-" + cleaned.substring(0, 4) + "-" + cleaned.substring(4, 8) + "-"
                + cleaned.substring(8, 12) + "-" + cleaned.substring(12, 16);
    }

    /**
     * Computes the SHA-256 hash of the canonical recovery code.
     */
    public static String hashCode(String canonicalCode) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(canonicalCode.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 message digest algorithm not available", e);
        }
    }
}

