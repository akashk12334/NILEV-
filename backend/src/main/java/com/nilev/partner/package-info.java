/**
 * Partner Module.
 * Responsible for partner linking, invitation codes, and shared relationship state.
 *
 * Layered structure:
 * - {@code controller}: REST controllers consuming and returning DTOs
 * - {@code service}: Business services interface and implementation
 * - {@code repository}: JPA repositories for partner persistence
 * - {@code entity}: Domain JPA entities
 * - {@code dto}: Request and response transfer objects
 */
package com.nilev.partner;
