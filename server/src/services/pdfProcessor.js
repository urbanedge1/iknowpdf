import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { supabase } from '../config/database.js';
import { getS3Client, uploadToS3, getSignedUrl } from '../config/aws.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export async function processPDFJob(jobData) {
  const { jobId, toolId, files, options, userId } = jobData;
  
  try {
    // Update job status to processing
    await updateJobStatus(jobId, 'processing', 0);
    
    let result;
    
    switch (toolId) {
      case 'merge-pdf':
        result = await mergePDFs(files, options);
        break;
      case 'split-pdf':
        result = await splitPDF(files[0], options);
        break;
      case 'compress-pdf':
        result = await compressPDF(files[0], options);
        break;
      case 'pdf-to-word':
        result = await convertPDFToWord(files[0], options);
        break;
      case 'pdf-to-excel':
        result = await convertPDFToExcel(files[0], options);
        break;
      case 'pdf-to-jpg':
        result = await convertPDFToImages(files[0], options);
        break;
      case 'image-to-pdf':
        result = await convertImagesToPDF(files, options);
        break;
      case 'protect-pdf':
        result = await protectPDF(files[0], options);
        break;
      case 'unlock-pdf':
        result = await unlockPDF(files[0], options);
        break;
      case 'rotate-pages':
        result = await rotatePages(files[0], options);
        break;
      case 'add-watermark':
        result = await addWatermark(files[0], options);
        break;
      default:
        throw new Error(`Tool ${toolId} not implemented`);
    }
    
    // Save result files
    const resultFileIds = await saveResultFiles(jobId, userId, result);
    
    // Update job status to completed
    await updateJobStatus(jobId, 'completed', 100, { resultFileIds });
    
    logger.info(`Job ${jobId} completed successfully`);
    return { success: true, jobId, resultFileIds };
    
  } catch (error) {
    logger.error(`Job ${jobId} failed:`, error);
    await updateJobStatus(jobId, 'failed', 0, { error: error.message });
    throw error;
  }
}

async function updateJobStatus(jobId, status, progress, metadata = {}) {
  const updateData = {
    status,
    progress,
    updated_at: new Date()
  };
  
  if (status === 'completed') {
    updateData.completed_at = new Date();
  }
  
  if (metadata.error) {
    updateData.error_message = metadata.error;
  }
  
  if (metadata.resultFileIds) {
    updateData.result_metadata = { resultFileIds: metadata.resultFileIds };
  }
  
  await supabase
    .from('processing_jobs')
    .update(updateData)
    .eq('id', jobId);
}

async function getFileBuffer(file) {
  const s3 = getS3Client();
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: file.s3_key
  };
  
  const result = await s3.getObject(params).promise();
  return result.Body;
}

async function mergePDFs(files, options) {
  const mergedPdf = await PDFDocument.create();
  
  for (let i = 0; i < files.length; i++) {
    const fileBuffer = await getFileBuffer(files[i]);
    const pdf = await PDFDocument.load(fileBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    
    pages.forEach((page) => mergedPdf.addPage(page));
    
    // Update progress
    const progress = Math.round(((i + 1) / files.length) * 80);
    await updateJobStatus(files[0].job_id, 'processing', progress);
  }
  
  const pdfBytes = await mergedPdf.save();
  
  return [{
    buffer: Buffer.from(pdfBytes),
    fileName: `merged_${Date.now()}.pdf`,
    contentType: 'application/pdf'
  }];
}

async function splitPDF(file, options) {
  const fileBuffer = await getFileBuffer(file);
  const pdf = await PDFDocument.load(fileBuffer);
  const pageCount = pdf.getPageCount();
  
  const results = [];
  const { splitType = 'pages', ranges = [] } = options;
  
  if (splitType === 'pages') {
    // Split into individual pages
    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(page);
      
      const pdfBytes = await newPdf.save();
      results.push({
        buffer: Buffer.from(pdfBytes),
        fileName: `page_${i + 1}_${Date.now()}.pdf`,
        contentType: 'application/pdf'
      });
      
      // Update progress
      const progress = Math.round(((i + 1) / pageCount) * 80);
      await updateJobStatus(file.job_id, 'processing', progress);
    }
  } else if (splitType === 'ranges' && ranges.length > 0) {
    // Split by page ranges
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      const newPdf = await PDFDocument.create();
      const pageIndices = [];
      
      for (let pageNum = range.start - 1; pageNum < range.end; pageNum++) {
        if (pageNum < pageCount) {
          pageIndices.push(pageNum);
        }
      }
      
      const pages = await newPdf.copyPages(pdf, pageIndices);
      pages.forEach((page) => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      results.push({
        buffer: Buffer.from(pdfBytes),
        fileName: `pages_${range.start}-${range.end}_${Date.now()}.pdf`,
        contentType: 'application/pdf'
      });
      
      // Update progress
      const progress = Math.round(((i + 1) / ranges.length) * 80);
      await updateJobStatus(file.job_id, 'processing', progress);
    }
  }
  
  return results;
}

async function compressPDF(file, options) {
  // This is a simplified compression - in production you'd use more sophisticated methods
  const fileBuffer = await getFileBuffer(file);
  const pdf = await PDFDocument.load(fileBuffer);
  
  // Basic compression by re-saving the PDF
  const pdfBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false
  });
  
  return [{
    buffer: Buffer.from(pdfBytes),
    fileName: `compressed_${file.original_name}`,
    contentType: 'application/pdf'
  }];
}

async function convertPDFToWord(file, options) {
  // This would require a more sophisticated PDF to Word conversion library
  // For now, we'll create a placeholder implementation
  throw new Error('PDF to Word conversion not yet implemented');
}

async function convertPDFToExcel(file, options) {
  // This would require a more sophisticated PDF to Excel conversion library
  // For now, we'll create a placeholder implementation
  throw new Error('PDF to Excel conversion not yet implemented');
}

async function convertPDFToImages(file, options) {
  // This would require pdf2pic or similar library
  // For now, we'll create a placeholder implementation
  throw new Error('PDF to Images conversion not yet implemented');
}

async function convertImagesToPDF(files, options) {
  const pdf = await PDFDocument.create();
  
  for (let i = 0; i < files.length; i++) {
    const fileBuffer = await getFileBuffer(files[i]);
    
    // Process image with Sharp
    const processedImage = await sharp(fileBuffer)
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const image = await pdf.embedJpg(processedImage);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height
    });
    
    // Update progress
    const progress = Math.round(((i + 1) / files.length) * 80);
    await updateJobStatus(files[0].job_id, 'processing', progress);
  }
  
  const pdfBytes = await pdf.save();
  
  return [{
    buffer: Buffer.from(pdfBytes),
    fileName: `images_to_pdf_${Date.now()}.pdf`,
    contentType: 'application/pdf'
  }];
}

async function protectPDF(file, options) {
  const fileBuffer = await getFileBuffer(file);
  const pdf = await PDFDocument.load(fileBuffer);
  
  const { userPassword, ownerPassword, permissions = {} } = options;
  
  const pdfBytes = await pdf.save({
    userPassword,
    ownerPassword,
    permissions: {
      printing: permissions.printing !== false,
      modifying: permissions.modifying !== false,
      copying: permissions.copying !== false,
      annotating: permissions.annotating !== false,
      fillingForms: permissions.fillingForms !== false,
      contentAccessibility: permissions.contentAccessibility !== false,
      documentAssembly: permissions.documentAssembly !== false
    }
  });
  
  return [{
    buffer: Buffer.from(pdfBytes),
    fileName: `protected_${file.original_name}`,
    contentType: 'application/pdf'
  }];
}

async function unlockPDF(file, options) {
  const fileBuffer = await getFileBuffer(file);
  const { password } = options;
  
  const pdf = await PDFDocument.load(fileBuffer, { password });
  const pdfBytes = await pdf.save();
  
  return [{
    buffer: Buffer.from(pdfBytes),
    fileName: `unlocked_${file.original_name}`,
    contentType: 'application/pdf'
  }];
}

async function rotatePages(file, options) {
  const fileBuffer = await getFileBuffer(file);
  const pdf = await PDFDocument.load(fileBuffer);
  const { rotation = 90, pages = 'all' } = options;
  
  const pageIndices = pages === 'all' ? 
    pdf.getPageIndices() : 
    pages.map(p => p - 1).filter(p => p >= 0 && p < pdf.getPageCount());
  
  pageIndices.forEach(pageIndex => {
    const page = pdf.getPage(pageIndex);
    page.setRotation({ angle: rotation });
  });
  
  const pdfBytes = await pdf.save();
  
  return [{
    buffer: Buffer.from(pdfBytes),
    fileName: `rotated_${file.original_name}`,
    contentType: 'application/pdf'
  }];
}

async function addWatermark(file, options) {
  const fileBuffer = await getFileBuffer(file);
  const pdf = await PDFDocument.load(fileBuffer);
  const { text, opacity = 0.5, fontSize = 50, color = 'gray' } = options;
  
  const pages = pdf.getPages();
  
  pages.forEach(page => {
    const { width, height } = page.getSize();
    
    page.drawText(text, {
      x: width / 4,
      y: height / 2,
      size: fontSize,
      opacity,
      rotate: { angle: 45 }
    });
  });
  
  const pdfBytes = await pdf.save();
  
  return [{
    buffer: Buffer.from(pdfBytes),
    fileName: `watermarked_${file.original_name}`,
    contentType: 'application/pdf'
  }];
}

async function saveResultFiles(jobId, userId, results) {
  const resultFileIds = [];
  
  for (const result of results) {
    const fileId = uuidv4();
    const fileKey = `${userId}/results/${fileId}_${result.fileName}`;
    
    // Upload to S3
    const uploadResult = await uploadToS3(
      result.buffer,
      fileKey,
      result.contentType,
      {
        jobId,
        userId,
        processedAt: new Date().toISOString()
      }
    );
    
    // Save to database
    const { data: resultFile, error } = await supabase
      .from('result_files')
      .insert([
        {
          id: fileId,
          job_id: jobId,
          user_id: userId,
          file_name: result.fileName,
          file_type: result.contentType,
          file_size: result.buffer.length,
          s3_key: fileKey,
          s3_url: uploadResult.Location,
          created_at: new Date()
        }
      ])
      .select()
      .single();
    
    if (error) {
      logger.error('Error saving result file:', error);
      throw new Error('Failed to save result file');
    }
    
    resultFileIds.push(fileId);
  }
  
  return resultFileIds;
}