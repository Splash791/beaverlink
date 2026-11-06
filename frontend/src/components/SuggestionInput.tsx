import { useState, type KeyboardEvent } from 'react'

type SuggestionInputProps = {
  id: string
  value: string
  options: string[]
  className: string
  placeholder?: string
  onChange: (value: string) => void
}

// Text input with a filtered list. Answers outside the list are still allowed.
function SuggestionInput({
  id,
  value,
  options,
  className,
  placeholder,
  onChange,
}: SuggestionInputProps) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)

  const query = value.trim().toLowerCase()
  const matches = options.filter((option) => option.toLowerCase().includes(query))
  const listId = `${id}-suggestions`
  const showList = open && matches.length > 0

  function choose(option: string) {
    onChange(option)
    setOpen(false)
    setHighlighted(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlighted(Math.min(highlighted + 1, matches.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted(Math.max(highlighted - 1, 0))
    } else if (event.key === 'Enter' && showList && highlighted >= 0) {
      // Pick the option instead of submitting the form.
      event.preventDefault()
      choose(matches[highlighted])
    } else if (event.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
          setHighlighted(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          // Keeps focus on the input so clicking an option doesn't close the list first.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
        >
          {matches.map((option, index) => (
            <li
              key={option}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === highlighted}
              ref={index === highlighted ? (item) => item?.scrollIntoView?.({ block: 'nearest' }) : undefined}
              onClick={() => choose(option)}
              className={`cursor-pointer px-3 py-2 text-base text-gray-800 hover:bg-orange-100 ${
                index === highlighted ? 'bg-orange-100' : ''
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SuggestionInput
