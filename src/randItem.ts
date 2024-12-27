export function randIdx<T>(array: T[]) {
	return Math.floor(Math.random() * array.length);
}

export function randItem<T>(array: T[]) {
	return array[randIdx(array)];
}
