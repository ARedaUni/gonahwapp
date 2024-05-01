package score

import (
	"context"
	"errors"
	"fmt"

	"github.com/amrojjeh/nahwapp/arabic"
	"github.com/amrojjeh/nahwapp/model"
)

type Score struct {
	Tag          string
	Score        int
	Determinable bool
}

func (s Score) String() (out string) {
	if s.Determinable {
		out = fmt.Sprintf("%s: %d", s.Tag, s.Score)
	} else {
		out = fmt.Sprintf("%s: ---", s.Tag)
	}
	return out
}

func (s Score) Buckwalter() (out string) {
	if s.Determinable {
		out = fmt.Sprintf("%s: %d", arabic.ToBuckwalter(s.Tag), s.Score)
	} else {
		out = fmt.Sprintf("%s: ---", arabic.ToBuckwalter(s.Tag))
	}
	return out
}

func fetchAttempts(ctx context.Context, q *model.Queries, student_id int, tag string) ([]model.TagAttempt, error) {
	attempts, err := q.ListTagAttemptsByStudent(ctx, model.ListTagAttemptsByStudentParams{
		StudentID: student_id,
		Tag:       tag,
		Limit:     30,
		Offset:    0,
	})
	if err != nil {
		return nil, errors.Join(fmt.Errorf("could not retrieve tags (id: %d, tag: %s)\n", student_id,
			arabic.ToBuckwalter(tag)), err)
	}
	return attempts, nil
}

func CalcScore(ctx context.Context, q *model.Queries, student_id int, tag string) (Score, error) {
	attempts, err := fetchAttempts(ctx, q, student_id, tag)
	if err != nil {
		return Score{}, err
	}
	if len(attempts) == 0 {
		return Score{Tag: tag, Determinable: false}, nil
	}
	score := 0
	for _, a := range attempts {
		if a.Correct && a.Tag == tag {
			score += 100
		}
	}
	score /= len(attempts)
	return Score{
		Tag:          tag,
		Score:        score,
		Determinable: true,
	}, nil
}
