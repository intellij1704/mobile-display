import React, { useEffect, useState, useMemo } from 'react';
import JoditEditor from 'jodit-react';

const WarrantyPolicy = ({ data, handleData }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Enter warranty policy content here...',
      height: 300,
      buttons: [
        'bold',
        'italic',
        'underline',
        '|',
        'ul',
        'ol',
        '|',
        'outdent',
        'indent',
        '|',
        'font',
        'fontsize',
        'brush',
        'paragraph',
        '|',
        'image',
        'table',
        'link',
        '|',
        'align',
        'undo',
        'redo',
        '|',
        'hr',
        'eraser',
        'copyformat',
        '|',
        'fullsize',
        'print',
        'about',
      ],
      extraPlugins: ['lists'],
      iframe: true,
      iframeCSSLinks: [],
      style: {
        ul: {
          'list-style-type': 'disc',
          'padding-left': '17px',
          margin: '0 0 20px 0',
        },
        li: {
          'margin-bottom': '10px',
        },
      },
      editorCssClass: 'jodit-custom-list',
    }),
    []
  );

  return (
    <section className="flex flex-col gap-3 bg-white border p-4 rounded-xl h-full">
      <h1 className="font-semibold">Warranty Policy</h1>
      {isMounted ? (
        <JoditEditor
          value={data?.warrantyPolicy || ''}
          config={config}
          onBlur={(newContent) => handleData('warrantyPolicy', newContent)}
          className="w-full border rounded bg-white text-gray-900"
        />
      ) : (
        <div className="p-3 border rounded bg-gray-100 text-gray-500">
          Loading editor...
        </div>
      )}
      <style jsx global>{`
        .jodit-custom-list .jodit-wysiwyg ul {
          list-style-type: disc !important;
          padding-left: 17px !important;
          margin: 0 0 20px 0 !important;
        }
        .jodit-custom-list .jodit-wysiwyg li {
          margin-bottom: 10px !important;
        }
      `}</style>
    </section>
  );
};

export default WarrantyPolicy;