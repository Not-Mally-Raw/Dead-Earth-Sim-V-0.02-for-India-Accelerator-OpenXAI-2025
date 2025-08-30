// Minimal SymptomAssessment class to mock API
export class SymptomAssessment {
  static async list() {
    // Load from JSON for now
    const response = await fetch('/Entities/SymptomAssessment.json');
    return response.json();
  }
}
