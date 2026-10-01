package com.nilev.companion.dto;

import com.nilev.companion.entity.AnimalType;
import jakarta.validation.constraints.Size;

public class UpdateCompanionRequest {

    private AnimalType animalType;

    @Size(max = 50, message = "Name cannot exceed 50 characters")
    private String name;

    public UpdateCompanionRequest() {}

    public AnimalType getAnimalType() { return animalType; }
    public void setAnimalType(AnimalType animalType) { this.animalType = animalType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
