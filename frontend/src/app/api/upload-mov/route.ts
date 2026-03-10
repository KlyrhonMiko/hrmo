import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const documentType = formData.get('documentType') as string | null;
        const serialNumber = formData.get('serialNumber') as string | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No MOV file uploaded' },
                { status: 400 }
            );
        }

        if (!documentType || !serialNumber) {
            return NextResponse.json(
                { error: 'Missing document type or serial number' },
                { status: 400 }
            );
        }

        // In a real application, upload the file to S3, Google Cloud Storage,
        // or Cloudinary, and save the metadata to the database.

        // A mock secure URL after uploading
        const secureUrl = `https://storage.plp.edu.ph/hrdo/movs/${crypto.randomUUID()}-${file.name}`;

        // TODO: Insert doc record into DB mapping to employee

        return NextResponse.json(
            {
                message: 'File uploaded successfully',
                url: secureUrl,
                documentType,
                serialNumber
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error in /api/upload-mov:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
