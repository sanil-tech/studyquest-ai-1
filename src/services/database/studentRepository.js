import { base44 } from './base44Client';

/**
 * Repository layer for Student entity using Base44 Cloud.
 */

export const createStudent = async (id, name, curriculum, yearLevel) => {
  try {
    const response = await base44.entities.Student.create({
      id, // Assuming Base44 accepts passing ID, or we map it if Base44 auto-generates.
      name,
      curriculum,
      year_level: yearLevel,
      created_at: new Date().toISOString()
    });
    
    // Simulate initial profile logic local structure (until fully migrated)
    return {
      ...response,
      profile: {
        student_id: id,
        current_level: `${curriculum}_${yearLevel}`,
        xp: 0,
        streak: 0,
        learning_status: 'NEW'
      }
    };
  } catch (error) {
    console.error("Failed to create student in Base44:", error);
    throw error;
  }
};

export const getStudent = async (id) => {
  try {
    const response = await base44.entities.Student.filter({ id });
    
    if (response && response.length > 0) {
      const student = response[0];
      // Attach mock profile for compatibility
      student.profile = {
        student_id: student.id,
        current_level: `${student.curriculum}_${student.year_level}`,
        xp: 0,
        streak: 0,
        learning_status: 'ACTIVE'
      };
      return student;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch student from Base44:", error);
    return null; // Fallback state
  }
};

export const updateStudentProfile = async (id, updates) => {
  try {
    // Only update allowed fields on Student, or track profile separately
    if (updates.name || updates.year_level || updates.curriculum) {
      const dbUpdates = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.year_level) dbUpdates.year_level = updates.year_level;
      if (updates.curriculum) dbUpdates.curriculum = updates.curriculum;
      
      await base44.entities.Student.update(id, dbUpdates);
    }
    
    const student = await getStudent(id);
    return student;
  } catch (error) {
    console.error("Failed to update student in Base44:", error);
    throw error;
  }
};
