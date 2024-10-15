exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to];
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    };
  });
};

exports.commentCounter = (arr) => {
  newArr = arr.map(element => {
    return {...element}
  })
  const results = []
  const articleIds = []
  newArr.forEach(article => {
    if (!articleIds.includes(article.article_id)) {
      articleIds.push(article.article_id)
      article.comment_count = 0
      results.push({...article})
    }
    if (article.comment_id !== null) {
      results.forEach(element => {
        if (element.article_id === article.article_id) {
          element.comment_count++
        }
      })
    }
  })
  results.forEach(element => {
    delete element.comment_id
  })
  return results
}
