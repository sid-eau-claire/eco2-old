declare module 'react-quill' {
  import { Component } from 'react';

  interface QuillOptions {
    theme?: string;
    modules?: any;
    readOnly?: boolean;
    bounds?: string | HTMLElement;
    placeholder?: string;
    scrollingContainer?: string | HTMLElement | null;
    preserveWhitespace?: boolean;
  }

  export interface QuillEditorProps extends QuillOptions {
    value: string;
    defaultValue?: string;
    readOnly?: boolean;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    onChangeSelection?: (range: any, source: string, editor: any) => void;
    onFocus?: (range: any, source: string, editor: any) => void;
    onBlur?: (previousRange: any, source: string, editor: any) => void;
    theme?: string;
    modules?: any;
  }

  export default class QuillEditor extends Component<QuillEditorProps> {}
}
