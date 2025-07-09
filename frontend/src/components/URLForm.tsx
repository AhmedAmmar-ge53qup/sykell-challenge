export default function URLForm({ onSubmit }: { onSubmit: (url: string) => void }) {

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const url = Object.fromEntries(formData).url
        if (!url) return
        onSubmit(url as string)

        e.currentTarget.reset();
      }}
      className="flex gap-4"
    >
      <input
        className="flex-1 px-4 py-2 border rounded-xl"
        placeholder="Enter URL"
        name="url"
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
        Crawl
      </button>
    </form>
  )
}
