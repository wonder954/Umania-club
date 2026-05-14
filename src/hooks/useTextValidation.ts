export const useTextValidation = () => {
    const validate = (text: string): string | null => {
        const trimmed = text.trim();

        if (trimmed.length === 0) return "コメントを入力してください";
        if (trimmed.length > 200) return "200文字以内で入力してください";

        const ngWords = ["死ね", "殺す", "バカ"];
        if (ngWords.some((w) => trimmed.includes(w))) {
            return "不適切な表現が含まれています";
        }

        return null;
    };

    return { validate };
};