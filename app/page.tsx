"use client";
import Image from "next/image";
import { useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";

export default function Home() {
	const [imageInfo, setImageInfo] = useState({
		qrUrl: "",
		downloadUrl: "",
		previewUrl: ""
	});

	const generateQr = async (text: string) => {
		const QrUrl = await QRCode.toDataURL(text);
		return QrUrl;
	};

	const handleChange = async (e: any) => {
		const formData = new FormData();
		formData.append("file", e.target.files[0]);
		const data = await fetch(
			"https://nextjs-file-uploader-nine.vercel.app/api/file",
			{
				method: "POST",
				body: formData
			}
		);
		const json = await data.json();
		const qrUri = await generateQr(json.url);
		setImageInfo({
			downloadUrl: json.downloadUrl,
			previewUrl: json.url,
			qrUrl: qrUri
		});
	};
	return (
		<main className="bg-gradient-to-r from-amber-500 to-pink-500 flex min-h-screen flex-col items-center justify-center">
			<h1 className="font-bold text-white text-4xl pb-10">
				Nextjs Image Uploader App
			</h1>
			<p className="font-bold leading-5 text-white text-xl py-10">
				The image you upload will be deleted within 60 seconds...
			</p>
			{imageInfo.previewUrl === "" ? (
				<div className="flex items-center justify-center w-[200px] md:w-[400px]">
					<label
						htmlFor="dropzone-file"
						className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
						<div className="flex flex-col items-center justify-center pt-5 pb-6">
							<svg
								className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 20 16">
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
								/>
							</svg>
							<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
								<span className="font-semibold"></span>
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								SVG, PNG, JPG or GIF
							</p>
						</div>
						<input
							id="dropzone-file"
							onChange={handleChange}
							type="file"
							className="hidden"
						/>
					</label>
				</div>
			) : (
				<div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
					<Image
						className="object-cover w-fit rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
						src={imageInfo.qrUrl}
						alt=""
						height="100"
						width="100"
					/>
					<div className="flex flex-col w-[200px] lg:w-fit flex-wrap justify-between p-4 leading-normal overflow-hidden">
						<h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
							<Link href={imageInfo.previewUrl} target="_blank">
								<span>Preview: </span>
								<span className="hidden lg:flex">{imageInfo.previewUrl}</span>
							</Link>
						</h5>
						<h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
							<Link href={imageInfo.downloadUrl} target="_blank">
								<span>Download: </span>
								<span className="hidden lg:flex">{imageInfo.downloadUrl}</span>
							</Link>
						</h5>
						<button
							type="button"
							onClick={() =>
								setImageInfo({ downloadUrl: "", qrUrl: "", previewUrl: "" })
							}
							className="text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-orange-600 dark:hover:bg-orange-700 focus:outline-none dark:focus:ring-orange-800">
							Upload new file
						</button>
					</div>
				</div>
			)}
		</main>
	);
}
