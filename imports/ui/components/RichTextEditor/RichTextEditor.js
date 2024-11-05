import PropTypes from 'prop-types';
import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';

import './RichTextEditor.scss';

import {
  $createParagraphNode,
  $getRoot,
  $insertNodes,
  CLEAR_HISTORY_COMMAND,
} from 'lexical';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import Theme from './Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

function OnChangePlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState, editor);
    });
  }, [editor, onChange]);

  return null;
}

function LoadHtmlPlugin({ savedHTMLCode }) {
  const [editor] = useLexicalComposerContext();

  let savedHTML = '<div></div>';
  if (typeof savedHTMLCode === 'string') {
    editor.update(() => {
      if (savedHTML != savedHTMLCode) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(savedHTMLCode, 'text/html');
        $getRoot().clear();

        const nodes = $generateNodesFromDOM(editor, dom);
        const selection = $getRoot().select();
        selection.insertNodes(nodes);
        savedHTML = savedHTMLCode;
      }
    });
  }
  return null;
}

function RichTextEditor({ nameSpace, savedHTMLCode, onChange }) {
  const editorRef = useRef(undefined);
  const placeholder = 'Enter some rich text...';
  const initialConfig = {
    namespace: nameSpace,
    //editorState: initialEditorState,
    nodes: [],
    onError,
    theme: Theme,
  };

  function onChangeEditor(editorState, editor) {
    editorRef.current = editor;
    let htmlString = '';
    editor.update(() => {
      htmlString = $generateHtmlFromNodes(editor, null);
      onChange(htmlString);
    });
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container border">
        <ToolbarPlugin />
        <div className="editor-inner border">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="editor-placeholder">{placeholder}</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <LoadHtmlPlugin savedHTMLCode={savedHTMLCode} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={onChangeEditor} />
        </div>
      </div>
    </LexicalComposer>
  );
}

RichTextEditor.propTypes = {
  onChange: PropTypes.func,
  nameSpace: PropTypes.string,
};

export default RichTextEditor;
