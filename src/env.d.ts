/// <reference types="vite/client" />

type FontData = {
	readonly family: string;
	readonly fullName: string;
	readonly postscriptName: string;
	readonly style: string;
};

// https://developer.mozilla.org/en-US/docs/Web/API/Window/queryLocalFonts
interface Permissions {
	query(permissionDesc: { name: 'local-fonts' }): Promise<PermissionStatus>;
}

interface Window {
	queryLocalFonts: undefined | (() => Promise<ReadonlyArray<FontData>>);
}
