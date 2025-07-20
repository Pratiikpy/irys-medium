import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import irysService from '../../services/irys';

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) {
    return null;
  }

  const addImage = useCallback(async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await onImageUpload(file);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        }
      }
    };
    
    fileInput.click();
  }, [onImageUpload]);

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const buttons = [
    {
      label: 'Bold',
      icon: 'B',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
      className: 'font-bold'
    },
    {
      label: 'Italic',
      icon: 'I',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
      className: 'italic'
    },
    {
      label: 'Strike',
      icon: 'S',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
      className: 'line-through'
    },
    {
      label: 'Code',
      icon: '</>',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code'),
      className: 'font-mono text-xs'
    },
    {
      label: 'H1',
      icon: 'H1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
      className: 'text-sm font-bold'
    },
    {
      label: 'H2',
      icon: 'H2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
      className: 'text-sm font-bold'
    },
    {
      label: 'H3',
      icon: 'H3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
      className: 'text-sm font-bold'
    },
    {
      label: 'Bullet List',
      icon: '•',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
      className: 'text-lg'
    },
    {
      label: 'Ordered List',
      icon: '1.',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
      className: 'text-sm'
    },
    {
      label: 'Code Block',
      icon: '{}',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
      className: 'font-mono text-sm'
    },
    {
      label: 'Blockquote',
      icon: '"',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
      className: 'text-lg'
    },
    {
      label: 'Horizontal Rule',
      icon: '—',
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
      className: 'text-lg'
    },
    {
      label: 'Link',
      icon: '🔗',
      action: addLink,
      isActive: () => editor.isActive('link'),
      className: 'text-sm'
    },
    {
      label: 'Image',
      icon: '🖼️',
      action: addImage,
      isActive: () => false,
      className: 'text-sm'
    }
  ];

  return (
    <div className="border-b border-gray-700 p-3 flex flex-wrap gap-2">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.action}
          className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
            button.isActive() 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } ${button.className}`}
          title={button.label}
        >
          {button.icon}
        </button>
      ))}
      
      <div className="border-l border-gray-600 mx-2"></div>
      
      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="px-3 py-1 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        title="Undo"
      >
        ↶
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="px-3 py-1 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        title="Redo"
      >
        ↷
      </button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your article..." }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file) => {
    setIsUploading(true);
    try {
      const result = await irysService.uploadImage(file);
      
      // Insert image into editor
      if (editor) {
        editor.chain().focus().setImage({ src: result.url }).run();
      }
      
      console.log('✅ Image uploaded and inserted:', result.url);
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-400 underline hover:text-indigo-300',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      onChange({
        html,
        text,
        json: editor.getJSON(),
        isEmpty: editor.isEmpty
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none p-6 min-h-[400px] outline-none',
      },
    },
  });

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <MenuBar editor={editor} onImageUpload={handleImageUpload} />
      
      {isUploading && (
        <div className="bg-indigo-600 text-white text-center py-2 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading image to Irys...</span>
          </div>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className="bg-gray-900 text-gray-100 min-h-[400px]"
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;