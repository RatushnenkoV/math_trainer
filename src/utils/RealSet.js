/**
 * Модуль для работы с множествами действительных чисел
 * Поддерживает пустые множества, точки, интервалы и их объединения
 */

// ========= БАЗОВЫЙ КЛАСС =========

class SetBase {
    includes(x) {
        throw new Error('Method includes() must be implemented');
    }

    intersection(other) {
        throw new Error('Method intersection() must be implemented');
    }

    union(other) {
        throw new Error('Method union() must be implemented');
    }

    equals(other) {
        throw new Error('Method equals() must be implemented');
    }
}


// ========= ПУСТОЕ МНОЖЕСТВО =========

class EmptySet extends SetBase {
    includes(x) {
        return false;
    }

    intersection(other) {
        return this;
    }

    union(other) {
        return other;
    }

    equals(other) {
        return other instanceof EmptySet;
    }

    toString() {
        return '∅';
    }
}


// ========= ТОЧКА =========

class Point extends SetBase {
    constructor(x) {
        super();
        this.x = x;
    }

    includes(x) {
        return this.x === x;
    }

    intersection(other) {
        if (other.includes(this.x)) {
            return this;
        }
        return new EmptySet();
    }

    union(other) {
        return UnionSet.normalize([this, other]);
    }

    equals(other) {
        return other instanceof Point && this.x === other.x;
    }

    toString() {
        return `{${this.x}}`;
    }
}


// ========= ИНТЕРВАЛ =========

class Interval extends SetBase {
    constructor(left, right, leftClosed = true, rightClosed = true) {
        super();

        if (left > right) {
            throw new Error('Левая граница больше правой');
        }

        this.left = left;
        this.right = right;
        this.leftClosed = leftClosed;
        this.rightClosed = rightClosed;
    }

    includes(x) {
        if (x < this.left || x > this.right) {
            return false;
        }
        if (x === this.left && !this.leftClosed) {
            return false;
        }
        if (x === this.right && !this.rightClosed) {
            return false;
        }
        return true;
    }

    intersection(other) {
        if (other instanceof EmptySet) {
            return new EmptySet();
        }

        if (other instanceof Point) {
            return this.includes(other.x) ? other : new EmptySet();
        }

        if (other instanceof Interval) {
            const left = Math.max(this.left, other.left);
            const right = Math.min(this.right, other.right);

            if (left > right) {
                return new EmptySet();
            }

            const leftClosed = (
                (this.left < other.left && other.leftClosed) ||
                (this.left > other.left && this.leftClosed) ||
                (this.left === other.left && this.leftClosed && other.leftClosed)
            );

            const rightClosed = (
                (this.right < other.right && this.rightClosed) ||
                (this.right > other.right && other.rightClosed) ||
                (this.right === other.right && this.rightClosed && other.rightClosed)
            );

            if (left === right) {
                return leftClosed && rightClosed ? new Point(left) : new EmptySet();
            }

            return new Interval(left, right, leftClosed, rightClosed);
        }

        if (other instanceof UnionSet) {
            return other.intersection(this);
        }

        throw new TypeError('Unknown set type');
    }

    union(other) {
        return UnionSet.normalize([this, other]);
    }

    equals(other) {
        return (
            other instanceof Interval &&
            this.left === other.left &&
            this.right === other.right &&
            this.leftClosed === other.leftClosed &&
            this.rightClosed === other.rightClosed
        );
    }

    toString() {
        const l = this.leftClosed ? '[' : '(';
        const r = this.rightClosed ? ']' : ')';
        return `${l}${this.left}, ${this.right}${r}`;
    }
}


// ========= ОБЪЕДИНЕНИЕ =========

class UnionSet extends SetBase {
    constructor(parts) {
        super();
        this.parts = parts;
    }

    static normalize(sets) {
        const elements = [];

        for (const s of sets) {
            if (s instanceof EmptySet) {
                continue;
            }
            if (s instanceof UnionSet) {
                elements.push(...s.parts);
            } else {
                elements.push(s);
            }
        }

        const intervals = [];
        const points = [];

        for (const e of elements) {
            if (e instanceof Point) {
                points.push(e);
            } else if (e instanceof Interval) {
                intervals.push(e);
            }
        }

        // Точки превращаем в интервалы
        for (const p of points) {
            intervals.push(new Interval(p.x, p.x, true, true));
        }

        if (intervals.length === 0) {
            return new EmptySet();
        }

        // Сортируем интервалы
        intervals.sort((a, b) => {
            if (a.left !== b.left) {
                return a.left - b.left;
            }
            // При равных левых границах, закрытая граница идёт первой
            return a.leftClosed === b.leftClosed ? 0 : (a.leftClosed ? -1 : 1);
        });

        const merged = [intervals[0]];

        for (let i = 1; i < intervals.length; i++) {
            const cur = intervals[i];
            const last = merged[merged.length - 1];

            // Проверяем пересечение/касание
            const overlap = (
                cur.left < last.right ||
                (cur.left === last.right && (cur.leftClosed || last.rightClosed))
            );

            if (overlap) {
                const newRight = Math.max(last.right, cur.right);
                const newRightClosed =
                    last.right > cur.right ? last.rightClosed :
                    cur.right > last.right ? cur.rightClosed :
                    last.rightClosed || cur.rightClosed;

                merged[merged.length - 1] = new Interval(
                    last.left,
                    newRight,
                    last.leftClosed,
                    newRightClosed
                );
            } else {
                merged.push(cur);
            }
        }

        // Если остался один интервал
        if (merged.length === 1) {
            const i = merged[0];
            if (i.left === i.right && i.leftClosed && i.rightClosed) {
                return new Point(i.left);
            }
            return i;
        }

        return new UnionSet(merged);
    }

    includes(x) {
        return this.parts.some(p => p.includes(x));
    }

    intersection(other) {
        const parts = this.parts.map(p => p.intersection(other));
        return UnionSet.normalize(parts);
    }

    union(other) {
        return UnionSet.normalize([...this.parts, other]);
    }

    equals(other) {
        return (
            other instanceof UnionSet &&
            this.parts.length === other.parts.length &&
            this.parts.every((a, i) => a.equals(other.parts[i]))
        );
    }

    toString() {
        return this.parts.map(p => p.toString()).join(' ∪ ');
    }
}
