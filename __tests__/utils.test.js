const {
  convertTimestampToDate,
  createRef,
  formatComments,
  commentCounter,
  checkIfOrderedMostRecent
} = require("../db/seeds/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createRef", () => {
  test("returns an empty object, when passed an empty array", () => {
    const input = [];
    const actual = createRef(input);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with a single items", () => {
    const input = [{ title: "title1", article_id: 1, name: "name1" }];
    let actual = createRef(input, "title", "article_id");
    let expected = { title1: 1 };
    expect(actual).toEqual(expected);
    actual = createRef(input, "name", "title");
    expected = { name1: "title1" };
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with many items", () => {
    const input = [
      { title: "title1", article_id: 1 },
      { title: "title2", article_id: 2 },
      { title: "title3", article_id: 3 },
    ];
    const actual = createRef(input, "title", "article_id");
    const expected = { title1: 1, title2: 2, title3: 3 };
    expect(actual).toEqual(expected);
  });
  test("does not mutate the input", () => {
    const input = [{ title: "title1", article_id: 1 }];
    const control = [{ title: "title1", article_id: 1 }];
    createRef(input);
    expect(input).toEqual(control);
  });
});

describe("formatComments", () => {
  test("returns an empty array, if passed an empty array", () => {
    const comments = [];
    expect(formatComments(comments, {})).toEqual([]);
    expect(formatComments(comments, {})).not.toBe(comments);
  });
  test("converts created_by key to author", () => {
    const comments = [{ created_by: "ant" }, { created_by: "bee" }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].author).toEqual("ant");
    expect(formattedComments[0].created_by).toBe(undefined);
    expect(formattedComments[1].author).toEqual("bee");
    expect(formattedComments[1].created_by).toBe(undefined);
  });
  test("replaces belongs_to value with appropriate id when passed a reference object", () => {
    const comments = [{ belongs_to: "title1" }, { belongs_to: "title2" }];
    const ref = { title1: 1, title2: 2 };
    const formattedComments = formatComments(comments, ref);
    expect(formattedComments[0].article_id).toBe(1);
    expect(formattedComments[1].article_id).toBe(2);
  });
  test("converts created_at timestamp to a date", () => {
    const timestamp = Date.now();
    const comments = [{ created_at: timestamp }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].created_at).toEqual(new Date(timestamp));
  });
});
describe("commentCounter", () => {
  test("returns a new array", () => {
    expect(Array.isArray(commentCounter([]))).toBe(true)
  })
  test("returns an array of objects with the article_id as the key and a count of the comments as the value", () => {
    const input = [
      {article_id: 1,
        comment_id: 1
      },
      {article_id: 2,
        comment_id: null
      },
      {article_id: 3,
        comment_id: 2
      },
      {article_id: 1,
        comment_id: 3
      }
    ]
    const output = [
      {article_id: 1, comment_count: 2},
      {article_id: 2, comment_count: 0},
      {article_id: 3, comment_count: 1}
    ]
    expect(commentCounter(input)).toEqual(output)
  })
  test("is a pure function - does mutate original", () => {
    const input = [
      {article_id: 1,
        comment_id: 1
      },
      {article_id: 2,
        comment_id: null
      },
      {article_id: 3,
        comment_id: 2
      },
      {article_id: 1,
        comment_id: 3
      }
    ]
    const control =  [
      {article_id: 1,
        comment_id: 1
      },
      {article_id: 2,
        comment_id: null
      },
      {article_id: 3,
        comment_id: 2
      },
      {article_id: 1,
        comment_id: 3
      }
    ]
    commentCounter(input)
    expect(input).toEqual(control)
  })
})
describe("checkIfOrderedMostRecent", () => {
  test("returns a boolean", () => {
    const input = [1, 2, 3, 4]
    expect(typeof checkIfOrderedMostRecent(input)).toBe('boolean')
  })
  test("returns true if numbers are sorted in descending order", () => {
    const input = [1, 2, 3, 4]
    const input2 = [132, 76, 23, 11, 5]
    expect(checkIfOrderedMostRecent(input)).toBe(false)
    expect(checkIfOrderedMostRecent(input2)).toBe(true)
  })
  test("converts date strings YYYY-MM-DD to numbers and correctly determines if they're ordered", () => {
    const input = ["2020-11-26", "1999-07-13", "1970-04-27"]
    const input2 = ["2020-11-26", "1999-07-13", "2003-04-27"]
    expect(checkIfOrderedMostRecent(input)).toBe(true)
    expect(checkIfOrderedMostRecent(input2)).toBe(false)
  })
  test("functions when there are added parts after the date in the string", () => {
    const input = ["2020-11-26vbyriyi", "1999-07-13h7hri", "1970-04-27787f"]
    const input2 = ["2020-11-26vbhfh", "1999-07-13.lyu", "2003-04-27rtyue?9"]
    expect(checkIfOrderedMostRecent(input)).toBe(true)
    expect(checkIfOrderedMostRecent(input2)).toBe(false)
  })
  test("is a pure function", () => {
    const input = ["2020-11-26vbyriyi", "1999-07-13h7hri", "1970-04-27787f"]
    const control = ["2020-11-26vbyriyi", "1999-07-13h7hri", "1970-04-27787f"]
    checkIfOrderedMostRecent(input)
    expect(input).toEqual(control)
  })
})
