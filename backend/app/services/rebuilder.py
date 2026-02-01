def rebuild_html(nodes_to_translate, translated_texts):
    for i, node in enumerate(nodes_to_translate):
        if i < len(translated_texts):
            original_text = node.string
            trans_text = translated_texts[i]

            if original_text and trans_text:
                if original_text.endswith(" ") and not trans_text.endswith(" "):
                    trans_text += " "
                if original_text.startswith(" ") and not trans_text.startswith(" "):
                    trans_text = " " + trans_text
            
            node.replace_with(trans_text)