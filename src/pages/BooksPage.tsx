import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, buildAssetUrl } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Book } from '../types'

type FormState = {
  title: string
  author: string
  description: string
  category: string
  publishedOn: string
  removePdfFile: boolean
  removeAudioFile: boolean
}

const emptyForm: FormState = {
  title: '',
  author: '',
  description: '',
  category: '',
  publishedOn: '',
  removePdfFile: false,
  removeAudioFile: false,
}

export function BooksPage() {
  const { token, user, isAdmin } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const canEditBook = useMemo(
    () => (book: Book) => isAdmin || book.uploadedById === user?.id,
    [isAdmin, user?.id],
  )

  useEffect(() => {
    if (!token) {
      return
    }

    void api
      .listBooks(token)
      .then(setBooks)
      .catch((loadError: Error) => setError(loadError.message))
  }, [token])

  const resetEditor = () => {
    setEditingBook(null)
    setForm(emptyForm)
    setPdfFile(null)
    setAudioFile(null)
  }

  const startEdit = (book: Book) => {
    setEditingBook(book)
    setForm({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      publishedOn: book.publishedOn ?? '',
      removePdfFile: false,
      removeAudioFile: false,
    })
    setPdfFile(null)
    setAudioFile(null)
  }

  const handleBookSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      return
    }

    setError('')
    setFeedback('')

    const body = new FormData()
    body.append('title', form.title)
    body.append('author', form.author)
    body.append('description', form.description)
    body.append('category', form.category)
    if (form.publishedOn) {
      body.append('publishedOn', form.publishedOn)
    }
    body.append('removePdfFile', String(form.removePdfFile))
    body.append('removeAudioFile', String(form.removeAudioFile))
    if (pdfFile) {
      body.append('pdfFile', pdfFile)
    }
    if (audioFile) {
      body.append('audioFile', audioFile)
    }

    try {
      if (editingBook) {
        const updatedBook = await api.updateBook(token, editingBook.id, body)
        setBooks((current) => current.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
        setFeedback('Book updated.')
      } else {
        const createdBook = await api.createBook(token, body)
        setBooks((current) => [createdBook, ...current])
        setFeedback('Book created.')
      }

      resetEditor()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save book.')
    }
  }

  const handleDelete = async (book: Book) => {
    if (!token) {
      return
    }

    try {
      await api.deleteBook(token, book.id)
      setBooks((current) => current.filter((item) => item.id !== book.id))
      if (editingBook?.id === book.id) {
        resetEditor()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed.')
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      await api.changePassword(token, passwordForm.currentPassword, passwordForm.newPassword)
      setFeedback('Password updated.')
      setPasswordForm({ currentPassword: '', newPassword: '' })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Password update failed.')
    }
  }

  return (
    <div className="grid-layout">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Library manager</p>
            <h2>{editingBook ? 'Edit book' : 'Add a new book'}</h2>
          </div>
          {editingBook ? (
            <button type="button" className="secondary" onClick={resetEditor}>
              Cancel edit
            </button>
          ) : null}
        </div>

        <form onSubmit={handleBookSubmit}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label>
            Author
            <input
              value={form.author}
              onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
              required
            />
          </label>
          <label>
            Category
            <input
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              required
            />
          </label>
          <label>
            Publish date
            <input
              value={form.publishedOn}
              onChange={(event) => setForm((current) => ({ ...current, publishedOn: event.target.value }))}
              type="date"
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={4}
            />
          </label>
          <label>
            PDF book
            <input type="file" accept=".pdf" onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)} />
          </label>
          <label>
            Audio book
            <input
              type="file"
              accept=".mp3,.wav,.m4a,.aac,.ogg"
              onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {editingBook ? (
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={form.removePdfFile}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, removePdfFile: event.target.checked }))
                  }
                />
                Remove current PDF
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.removeAudioFile}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, removeAudioFile: event.target.checked }))
                  }
                />
                Remove current audio
              </label>
            </div>
          ) : null}

          <button type="submit">{editingBook ? 'Save changes' : 'Create book'}</button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="sub-panel">
          <h3>Change password</h3>
          <label>
            Current password
            <input
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
              }
              type="password"
              required
            />
          </label>
          <label>
            New password
            <input
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
              }
              type="password"
              minLength={8}
              required
            />
          </label>
          <button type="submit" className="secondary">
            Update password
          </button>
        </form>

        {feedback ? <p className="success-text">{feedback}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Uploaded books</p>
            <h2>{books.length} items in library</h2>
          </div>
        </div>

        <div className="book-list">
          {books.map((book) => (
            <article key={book.id} className="book-card">
              <div className="book-card__top">
                <div>
                  <h3>{book.title}</h3>
                  <p>
                    {book.author} • {book.category}
                  </p>
                </div>
                {canEditBook(book) ? (
                  <div className="inline-actions">
                    <button type="button" className="secondary" onClick={() => startEdit(book)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => void handleDelete(book)}>
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>

              <p>{book.description}</p>
              <p className="muted">Uploaded by {book.uploadedByName}</p>

              <div className="inline-actions">
                {book.pdfFileUrl ? (
                  <a href={buildAssetUrl(book.pdfFileUrl) ?? '#'} target="_blank" rel="noreferrer">
                    View PDF
                  </a>
                ) : null}
                {book.audioFileUrl ? (
                  <a href={buildAssetUrl(book.audioFileUrl) ?? '#'} target="_blank" rel="noreferrer">
                    Listen audio
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
