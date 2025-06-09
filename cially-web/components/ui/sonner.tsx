"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			toastOptions={{
				unstyled: true,
				classNames: {
					error:
						"flex items-start gap-4 rounded-xl border border-red-500/10 border-t-red-500/20 border-l-red-500/20 bg-red-500/10 py-6 px-5 text-red-200 text-sm shadow-sm backdrop-blur-md",
					success:
						"flex items-start gap-4 rounded-xl border border-white/5 border-t-white/15 border-l-white/15 bg-green-400/10 py-6 px-5 text-white text-sm shadow-sm backdrop-blur-md",
					warning:
						"flex items-start gap-4 rounded-xl border border-yellow-500/10 border-t-yellow-500/20 border-l-yellow-500/20 bg-yellow-400/10 py-6 px-5 text-yellow-200 text-sm shadow-sm backdrop-blur-md",
					info: "flex items-start gap-4 rounded-xl border border-blue-500/10 border-t-blue-500/20 border-l-blue-500/20 bg-blue-400/10 py-6 px-5 text-blue-200 text-sm shadow-sm backdrop-blur-md",
				},
			}}
		/>
	);
};

export { Toaster };
