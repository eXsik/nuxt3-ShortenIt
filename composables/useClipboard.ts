export function useClipboard() {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch (err) {
      alert(`Sorry, there was a problem: ${err}`);
    }
  };

  return {
    copyToClipboard,
  };
}
