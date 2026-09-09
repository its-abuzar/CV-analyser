from sentence_transformers import SentenceTransformer, util

_model = SentenceTransformer('all-MiniLM-L6-v2')

def semantic_similarity(text1: str, text2: str) -> float:
    """Return a similarity score between 0 and 100."""
    if not text1 or not text2:
        return 0.0
    emb1 = _model.encode(text1, convert_to_tensor=True)
    emb2 = _model.encode(text2, convert_to_tensor=True)
    return util.cos_sim(emb1, emb2).item() * 100.0