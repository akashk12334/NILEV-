package com.nilev.companion.dto;

import com.nilev.companion.entity.AnimalType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ChooseCompanionRequest {

    @NotNull(message = "Animal type is required")
    private AnimalType animalType;

    @NotBlank(message = "Companion name is required")
    @Size(max = 50, message = "Name cannot exceed 50 characters")
    private String name;

    public ChooseCompanionRequest() {}

    public ChooseCompanionRequest(AnimalType animalType, String name) {
        this.animalType = animalType;
        this.name = name;
    }

    public AnimalType getAnimalType() { return animalType; }
    public void setAnimalType(AnimalType animalType) { this.animalType = animalType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
