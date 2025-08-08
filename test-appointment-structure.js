async function testAppointmentStructure() {
  try {
    // Test the appointments API to see the actual structure
    const response = await fetch('http://localhost:3000/api/users/cmdyyqbqb000dus5m5j7zfrt3/appointments');
    
    if (!response.ok) {
      console.log('Response status:', response.status);
      console.log('Response text:', await response.text());
      return;
    }
    
    const appointments = await response.json();
    
    if (appointments && appointments.length > 0) {
      console.log('=== APPOINTMENT STRUCTURE ===');
      console.log('Total appointments:', appointments.length);
      console.log('\n=== FIRST APPOINTMENT ===');
      console.log(JSON.stringify(appointments[0], null, 2));
      
      console.log('\n=== PROFESSIONAL STRUCTURE ===');
      if (appointments[0].professional) {
        console.log('Professional object:');
        console.log(JSON.stringify(appointments[0].professional, null, 2));
        
        console.log('\n=== PROFESSIONAL PROPERTIES ===');
        console.log('professional.name:', appointments[0].professional.name);
        console.log('professional.user:', appointments[0].professional.user);
        console.log('professional.user?.name:', appointments[0].professional.user?.name);
        console.log('professional.avatar:', appointments[0].professional.avatar);
        console.log('professional.type:', appointments[0].professional.type);
      }
    } else {
      console.log('No appointments found');
    }
    
  } catch (error) {
    console.error('Error testing appointment structure:', error.message);
  }
}

testAppointmentStructure();
