import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const generateCertificateHtml = (courseTitle, userName, completionDate, certId) => `
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; font-family: 'Georgia', serif; background: #f5f5f5; }
    .certificate { max-width: 900px; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border: 3px solid #d4af37; padding: 60px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { color: #8b5cf6; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 30px; }
    .title { font-size: 48px; color: #1f2937; margin: 30px 0; font-weight: bold; }
    .subtitle { font-size: 20px; color: #6b7280; margin: 20px 0; }
    .course { font-size: 28px; color: #8b5cf6; margin: 30px 0; font-weight: bold; }
    .details { color: #6b7280; font-size: 14px; margin: 30px 0; line-height: 1.8; }
    .signature { margin-top: 40px; border-top: 2px solid #d4af37; padding-top: 20px; color: #6b7280; }
    .cert-id { font-size: 12px; color: #9ca3af; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">Certificate of Completion</div>
    <div class="title">This is to certify that</div>
    <div class="subtitle">${userName}</div>
    <div class="course">has successfully completed</div>
    <div class="course">${courseTitle}</div>
    <div class="details">
      <p>Completion Date: ${new Date(completionDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p style="margin-top: 20px;">This certificate is awarded in recognition of demonstrated competency and dedication to professional development.</p>
    </div>
    <div class="signature">
      <p style="margin: 0;">Checks Direct Training Program</p>
      <div class="cert-id">Certificate ID: ${certId}</div>
    </div>
  </div>
</body>
</html>
`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all broken certificates (status=active with missing url or html)
    const allCerts = await base44.asServiceRole.entities.TrainingCertificate.list('-created_date', 1000);
    const brokenCerts = allCerts.filter(c => 
      c.status === 'active' && 
      (!c.certificate_url || !c.certificate_html)
    );

    if (brokenCerts.length === 0) {
      return Response.json({ repaired: 0, message: 'No broken certificates found' });
    }

    let repaired = 0;

    for (const cert of brokenCerts) {
      try {
        let courseTitle = cert.course_title;
        let learnerName = cert.learner_name;

        // Fetch course if title missing
        if (!courseTitle && cert.course_id) {
          const course = await base44.asServiceRole.entities.TrainingCourse.list();
          const found = course.find(c => c.id === cert.course_id);
          if (found) courseTitle = found.title;
        }

        // Fetch user if name missing
        if (!learnerName && cert.user_id) {
          try {
            const userList = await base44.asServiceRole.entities.User.list();
            const foundUser = userList.find(u => u.id === cert.user_id);
            if (foundUser) learnerName = foundUser.full_name;
          } catch (_) {
            // User list may not be accessible
          }
        }

        // Skip if critical data still missing
        if (!courseTitle || !learnerName) {
          continue;
        }

        // Generate certificate
        const certId = cert.certificate_id || `CERT-${cert.course_id}-${cert.user_id}-${Date.now()}`;
        const completedDate = cert.completed_date || cert.issued_date || new Date().toISOString().split('T')[0];
        const certificateHtml = generateCertificateHtml(courseTitle, learnerName, completedDate, certId);
        const certificateDataUrl = `data:text/html,${encodeURIComponent(certificateHtml)}`;
        
        // Calculate expiry date as 12 months from issued date
        const issued = new Date(completedDate);
        const expiry = new Date(issued.getFullYear() + 1, issued.getMonth(), issued.getDate());
        const expiryDate = expiry.toISOString().split('T')[0];

        // Update certificate
        await base44.asServiceRole.entities.TrainingCertificate.update(cert.id, {
          certificate_html: certificateHtml,
          certificate_url: certificateDataUrl,
          certificate_id: certId,
          expiry_date: expiryDate,
          file_generation_status: 'generated',
          course_title: courseTitle,
          learner_name: learnerName,
        });

        repaired++;
      } catch (e) {
        console.error(`Failed to repair certificate ${cert.id}:`, e.message);
      }
    }

    return Response.json({ repaired, total: brokenCerts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});