/**
 * Surprise Module.
 * Responsible for surprise messages, time-locked notes, and scheduled relationship surprises.
 *
 * Layered structure:
 * - {@code controller}: REST controllers consuming and returning DTOs
 * - {@code service}: Business services interface and implementation
 * - {@code repository}: JPA repositories
 * - {@code entity}: Domain JPA entities
 * - {@code dto}: Request and response transfer objects
 */
package com.nilev.surprise;
