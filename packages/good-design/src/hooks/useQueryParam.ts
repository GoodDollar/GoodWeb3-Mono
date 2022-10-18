export const useQueryParam = (param: string): string | null => {
	const params = new URLSearchParams(window.location.search);
	return params.get(param)
}
