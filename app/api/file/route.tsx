import { existsSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const fileToDelete: { [key: string]: NodeJS.Timeout } = {};

const generateRandomFileName = (file: File) => {
	const randomString = Math.random().toString(36).substring(7);
	const fileExt = path.extname(file.name);
	return `${randomString}_${Date.now()}${fileExt}`;
};

export const GET = async (req: NextRequest) => {
	const fileName = req.nextUrl.searchParams.get("f");
	if (!fileName) {
		return NextResponse.json(
			{ error: "The file could not be found!" },
			{ status: 400 }
		);
	}
	const filePath = path.join(
		process.cwd(),
		"public/upload",
		fileName?.toString()
	);
	try {
		const fileContent = await fs.readFile(filePath);
		const fileExt = path.extname(fileName);
		let contentType = "application/octet-stream";
		if (fileExt === ".jpg" || fileExt === ".jpeg") {
			contentType = "image/jpeg";
		}
		if (fileExt === ".png") {
			contentType = "image/png";
		}
		if (fileExt === ".svg") {
			contentType = "image/svg+xml";
		}
		if (fileExt === ".gif") {
			contentType = "image/gif";
		}
		const headers = {
			"Content-Disposition": "attachment; filename=" + fileName,
			"Content-Type": contentType,
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization"
		};
		return new Response(fileContent, {
			headers,
			status: 200
		});
	} catch (error) {
		console.log("Error=> ", error);
		return NextResponse.json(
			{ error: "File could not be found!" },
			{ status: 404 }
		);
	}
};

export const POST = async (req: NextRequest) => {
	try {
		const payload = await req.formData();
		const contentType = req.headers.get("content-type");
		if (!contentType || !contentType.startsWith("multipart/form-data")) {
			return NextResponse.json(
				{
					error: "Invalid content type!"
				},
				{ status: 400 }
			);
		}
		const file = payload.get("file") as File;
		const destinationPath = path.join(process.cwd(), "public/upload");

		if (!existsSync(destinationPath)) {
			await fs.mkdir(destinationPath, { recursive: true });
		}

		const randomFileName = generateRandomFileName(file);
		const filePath = path.join(destinationPath, randomFileName);
		const fileArrayBuffer = await file.arrayBuffer();
		await fs.writeFile(filePath, Buffer.from(fileArrayBuffer));

		console.log("File saved to: ", filePath);
		const deleteFileTimeOut = setTimeout(async () => {
			try {
				await fs.unlink(filePath);
				console.log("File has been deleted ", randomFileName);
				delete fileToDelete[randomFileName];
			} catch (error) {
				console.log("The file has not been deleted!");
			}
		}, 1 * 60 * 1000);
		fileToDelete[randomFileName] = deleteFileTimeOut;
		console.log(randomFileName);
		return NextResponse.json(
			{
				url:
					"https://nextjs-file-uploader-nine.vercel.app/upload/" +
					randomFileName,
				downloadUrl:
					"https://nextjs-file-uploader-nine.vercel.app/api/file/?f=" +
					randomFileName
			},
			{
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization"
				}
			}
		);
	} catch (error) {
		console.error("POST Error=>", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
};

export const OPTIONS = async () => {
	return new NextResponse(null, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization"
		}
	});
};
