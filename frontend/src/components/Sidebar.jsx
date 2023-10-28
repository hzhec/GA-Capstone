import { Link } from 'react-router-dom';

const Sidebar = () => {
	return (
		<div className="bg-white relative pl-3 overflow-y-scroll w-1/6 h-[65rem]">
			<div className="menu flex flex-col w-full font-medium">
				<details open>
					<summary className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<div className="flex items-center flex-grow text-[1.2rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark">
							Upload
						</div>
					</summary>
					<div>
						<span className="select-none flex items-center px-12 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/upload-image"
								className="flex items-center flex-grow text-[1.05rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
							>
								Image
							</Link>
						</span>
					</div>

					<div>
						<span className="select-none flex items-center px-12 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
							<a
								href="/upload-video"
								className="flex items-center flex-grow text-[1.05rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
							>
								Video
							</a>
						</span>
					</div>
				</details>
				<div>
					<span className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<a
							href="/live-camera"
							className="flex items-center flex-grow text-[1.2rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
						>
							Live Camera
						</a>
					</span>
				</div>

				<details open>
					<summary className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<div className="flex items-center flex-grow text-[1.2rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark">
							Processed
						</div>
					</summary>
					<div>
						<span className="select-none flex items-center px-12 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/processed-images"
								className="flex items-center flex-grow text-[1.05rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
							>
								Images
							</Link>
						</span>
					</div>

					<div>
						<span className="select-none flex items-center px-12 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/processed-videos"
								className="flex items-center flex-grow text-[1.05rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
							>
								Videos
							</Link>
						</span>
					</div>
				</details>
			</div>
		</div>
	);
};

export default Sidebar;
