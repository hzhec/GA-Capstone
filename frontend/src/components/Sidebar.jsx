import { Link } from 'react-router-dom';

const Sidebar = () => {
	return (
		<div className="bg-white relative pl-3 overflow-y-scroll w-1/5">
			<div className="flex flex-col w-full font-medium">
				<div>
					<span className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<Link
							to="/upload-image"
							className="flex items-center flex-grow text-[1.15rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
						>
							Upload Image
						</Link>
					</span>
				</div>

				<div>
					<span className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<a
							href="/upload-video"
							className="flex items-center flex-grow text-[1.15rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
						>
							Upload Video
						</a>
					</span>
				</div>

				<div>
					<span className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<Link
							to="/processed-images"
							className="flex items-center flex-grow text-[1.15rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
						>
							Images
						</Link>
					</span>
				</div>

				<div>
					<span className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<Link
							to="/processed-videos"
							className="flex items-center flex-grow text-[1.15rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
						>
							Videos
						</Link>
					</span>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
