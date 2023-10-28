import { Link } from 'react-router-dom';

const Sidebar = () => {
	return (
		<ul className="bg-white relative pl-3 overflow-y-scroll w-1/6 h-[65rem]">
			<li className="menu flex flex-col w-full font-medium">
				<details>
					<summary className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<div className="flex items-center flex-grow text-[1.2rem]  text-stone-500 hover:text-dark">
							Upload
						</div>
					</summary>
					<div>
						<span className="select-none flex items-center px-12 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/upload-image"
								className="flex items-center flex-grow text-[1.05rem]  text-stone-500 hover:text-dark"
							>
								Image
							</Link>
						</span>
					</div>

					<div>
						<span className="select-none flex items-center px-12 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/upload-video"
								className="flex items-center flex-grow text-[1.05rem]  text-stone-500 hover:text-dark"
							>
								Video
							</Link>
						</span>
					</div>
				</details>

				<details>
					<summary className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<div className="flex items-center flex-grow text-[1.2rem]  text-stone-500 hover:text-dark">
							Processed
						</div>
					</summary>
					<div>
						<span className="select-none flex items-center px-12 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/processed-images"
								className="flex items-center flex-grow text-[1.05rem]  text-stone-500 hover:text-dark"
							>
								Images
							</Link>
						</span>
					</div>

					<div>
						<span className="select-none flex items-center px-12 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/processed-videos"
								className="flex items-center flex-grow text-[1.05rem]  text-stone-500 hover:text-dark"
							>
								Videos
							</Link>
						</span>
					</div>
				</details>

				<div className="p-0">
					<span className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<Link
							to="/live-camera"
							className="flex items-center flex-grow text-[1.2rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
						>
							Live Camera
						</Link>
					</span>
				</div>
			</li>
		</ul>
	);
};

export default Sidebar;
