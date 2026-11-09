export function validateRequest(body){
 if(!body||typeof body!=='object')return 'Invalid request.';
 if(body.website)return 'Invalid request.';
 if(typeof body.message!=='string'||body.message.trim().length<2||body.message.length>2000)return 'Please enter a message of 2–2000 characters.';
 if(!['phone','sms','whatsapp'].includes(body.channel))return 'Choose a contact method.';
 if(typeof body.contact!=='string'||!/^\+?[\d\s()\-]{7,30}$/.test(body.contact))return 'Enter a valid contact number.';
 if(typeof body.safeTime!=='string'||body.safeTime.trim().length<2||body.safeTime.length>120)return 'Please provide a safe contact time.';
 if(body.consent!==true)return 'Consent is required.';
 if(body.provider!==null&&body.provider!==undefined&&(typeof body.provider!=='string'||body.provider.length>100))return 'Invalid provider.';
 return null;
}
