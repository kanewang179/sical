package types

import (
	"encoding/json"
	"fmt"
	"reflect"
)

// Comparable 可比较类型约束
type Comparable interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
		~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
		~float32 | ~float64 |
		~string
}

// Numeric 数值类型约束
type Numeric interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
		~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
		~float32 | ~float64
}

// Signed 有符号数值类型约束
type Signed interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 | ~float32 | ~float64
}

// Unsigned 无符号数值类型约束
type Unsigned interface {
	~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr
}

// Integer 整数类型约束
type Integer interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
		~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr
}

// Float 浮点数类型约束
type Float interface {
	~float32 | ~float64
}

// Validator 验证器接口
type Validator[T any] interface {
	Validate(value T) error
}

// Serializable 可序列化接口
type Serializable interface {
	json.Marshaler
	json.Unmarshaler
}

// TypeSafeContainer 类型安全容器
type TypeSafeContainer[T any] struct {
	value     T
	validator Validator[T]
	typeName  string
}

// NewTypeSafeContainer 创建新的类型安全容器
func NewTypeSafeContainer[T any](value T, validator Validator[T]) *TypeSafeContainer[T] {
	return &TypeSafeContainer[T]{
		value:     value,
		validator: validator,
		typeName:  reflect.TypeOf(value).String(),
	}
}

// Get 获取值
func (c *TypeSafeContainer[T]) Get() T {
	return c.value
}

// Set 设置值（带验证）
func (c *TypeSafeContainer[T]) Set(value T) error {
	if c.validator != nil {
		if err := c.validator.Validate(value); err != nil {
			return fmt.Errorf("validation failed for type %s: %w", c.typeName, err)
		}
	}
	c.value = value
	return nil
}

// TypeName 获取类型名称
func (c *TypeSafeContainer[T]) TypeName() string {
	return c.typeName
}

// IsZero 检查是否为零值
func (c *TypeSafeContainer[T]) IsZero() bool {
	return reflect.ValueOf(c.value).IsZero()
}

// TypeSafeSlice 类型安全切片
type TypeSafeSlice[T any] struct {
	items     []T
	validator Validator[T]
	maxSize   int
	typeName  string
}

// NewTypeSafeSlice 创建新的类型安全切片
func NewTypeSafeSlice[T any](validator Validator[T], maxSize int) *TypeSafeSlice[T] {
	var zero T
	return &TypeSafeSlice[T]{
		items:     make([]T, 0),
		validator: validator,
		maxSize:   maxSize,
		typeName:  reflect.TypeOf(zero).String(),
	}
}

// Add 添加元素
func (s *TypeSafeSlice[T]) Add(item T) error {
	if s.maxSize > 0 && len(s.items) >= s.maxSize {
		return fmt.Errorf("slice size limit exceeded: %d", s.maxSize)
	}
	
	if s.validator != nil {
		if err := s.validator.Validate(item); err != nil {
			return fmt.Errorf("validation failed for type %s: %w", s.typeName, err)
		}
	}
	
	s.items = append(s.items, item)
	return nil
}

// Get 获取指定索引的元素
func (s *TypeSafeSlice[T]) Get(index int) (T, error) {
	var zero T
	if index < 0 || index >= len(s.items) {
		return zero, fmt.Errorf("index out of range: %d", index)
	}
	return s.items[index], nil
}

// Set 设置指定索引的元素
func (s *TypeSafeSlice[T]) Set(index int, item T) error {
	if index < 0 || index >= len(s.items) {
		return fmt.Errorf("index out of range: %d", index)
	}
	
	if s.validator != nil {
		if err := s.validator.Validate(item); err != nil {
			return fmt.Errorf("validation failed for type %s: %w", s.typeName, err)
		}
	}
	
	s.items[index] = item
	return nil
}

// Len 获取长度
func (s *TypeSafeSlice[T]) Len() int {
	return len(s.items)
}

// ToSlice 转换为普通切片
func (s *TypeSafeSlice[T]) ToSlice() []T {
	result := make([]T, len(s.items))
	copy(result, s.items)
	return result
}

// Filter 过滤元素
func (s *TypeSafeSlice[T]) Filter(predicate func(T) bool) *TypeSafeSlice[T] {
	filtered := NewTypeSafeSlice[T](s.validator, s.maxSize)
	for _, item := range s.items {
		if predicate(item) {
			_ = filtered.Add(item) // 已验证过的元素不会失败
		}
	}
	return filtered
}

// Map 映射元素到新类型
func Map[T, U any](s *TypeSafeSlice[T], mapper func(T) U, validator Validator[U]) *TypeSafeSlice[U] {
	mapped := NewTypeSafeSlice[U](validator, s.maxSize)
	for _, item := range s.items {
		mappedItem := mapper(item)
		_ = mapped.Add(mappedItem)
	}
	return mapped
}

// TypeSafeMap 类型安全映射
type TypeSafeMap[K Comparable, V any] struct {
	items         map[K]V
	keyValidator  Validator[K]
	valueValidator Validator[V]
	maxSize       int
	keyTypeName   string
	valueTypeName string
}

// NewTypeSafeMap 创建新的类型安全映射
func NewTypeSafeMap[K Comparable, V any](keyValidator Validator[K], valueValidator Validator[V], maxSize int) *TypeSafeMap[K, V] {
	var zeroK K
	var zeroV V
	return &TypeSafeMap[K, V]{
		items:         make(map[K]V),
		keyValidator:  keyValidator,
		valueValidator: valueValidator,
		maxSize:       maxSize,
		keyTypeName:   reflect.TypeOf(zeroK).String(),
		valueTypeName: reflect.TypeOf(zeroV).String(),
	}
}

// Set 设置键值对
func (m *TypeSafeMap[K, V]) Set(key K, value V) error {
	if m.maxSize > 0 && len(m.items) >= m.maxSize {
		if _, exists := m.items[key]; !exists {
			return fmt.Errorf("map size limit exceeded: %d", m.maxSize)
		}
	}
	
	if m.keyValidator != nil {
		if err := m.keyValidator.Validate(key); err != nil {
			return fmt.Errorf("key validation failed for type %s: %w", m.keyTypeName, err)
		}
	}
	
	if m.valueValidator != nil {
		if err := m.valueValidator.Validate(value); err != nil {
			return fmt.Errorf("value validation failed for type %s: %w", m.valueTypeName, err)
		}
	}
	
	m.items[key] = value
	return nil
}

// Get 获取值
func (m *TypeSafeMap[K, V]) Get(key K) (V, bool) {
	value, exists := m.items[key]
	return value, exists
}

// Delete 删除键值对
func (m *TypeSafeMap[K, V]) Delete(key K) {
	delete(m.items, key)
}

// Keys 获取所有键
func (m *TypeSafeMap[K, V]) Keys() []K {
	keys := make([]K, 0, len(m.items))
	for key := range m.items {
		keys = append(keys, key)
	}
	return keys
}

// Values 获取所有值
func (m *TypeSafeMap[K, V]) Values() []V {
	values := make([]V, 0, len(m.items))
	for _, value := range m.items {
		values = append(values, value)
	}
	return values
}

// Len 获取长度
func (m *TypeSafeMap[K, V]) Len() int {
	return len(m.items)
}

// ToMap 转换为普通映射
func (m *TypeSafeMap[K, V]) ToMap() map[K]V {
	result := make(map[K]V, len(m.items))
	for key, value := range m.items {
		result[key] = value
	}
	return result
}

// Optional 可选类型
type Optional[T any] struct {
	value   T
	hasValue bool
}

// Some 创建有值的Optional
func Some[T any](value T) Optional[T] {
	return Optional[T]{value: value, hasValue: true}
}

// None 创建无值的Optional
func None[T any]() Optional[T] {
	return Optional[T]{hasValue: false}
}

// IsSome 检查是否有值
func (o Optional[T]) IsSome() bool {
	return o.hasValue
}

// IsNone 检查是否无值
func (o Optional[T]) IsNone() bool {
	return !o.hasValue
}

// Unwrap 获取值（如果无值则panic）
func (o Optional[T]) Unwrap() T {
	if !o.hasValue {
		panic("called Unwrap on None value")
	}
	return o.value
}

// UnwrapOr 获取值或默认值
func (o Optional[T]) UnwrapOr(defaultValue T) T {
	if o.hasValue {
		return o.value
	}
	return defaultValue
}

// Map 映射Optional值
func (o Optional[T]) Map(mapper func(T) T) Optional[T] {
	if o.hasValue {
		return Some(mapper(o.value))
	}
	return None[T]()
}

// FlatMap 扁平映射Optional值
func (o Optional[T]) FlatMap(mapper func(T) Optional[T]) Optional[T] {
	if o.hasValue {
		return mapper(o.value)
	}
	return None[T]()
}

// Filter 过滤Optional值
func (o Optional[T]) Filter(predicate func(T) bool) Optional[T] {
	if o.hasValue && predicate(o.value) {
		return o
	}
	return None[T]()
}

// Result 结果类型（类似Rust的Result）
type Result[T any] struct {
	value T
	err   error
}

// Ok 创建成功的Result
func Ok[T any](value T) Result[T] {
	return Result[T]{value: value, err: nil}
}

// Err 创建错误的Result
func Err[T any](err error) Result[T] {
	var zero T
	return Result[T]{value: zero, err: err}
}

// IsOk 检查是否成功
func (r Result[T]) IsOk() bool {
	return r.err == nil
}

// IsErr 检查是否错误
func (r Result[T]) IsErr() bool {
	return r.err != nil
}

// Unwrap 获取值（如果有错误则panic）
func (r Result[T]) Unwrap() T {
	if r.err != nil {
		panic(fmt.Sprintf("called Unwrap on Err value: %v", r.err))
	}
	return r.value
}

// UnwrapOr 获取值或默认值
func (r Result[T]) UnwrapOr(defaultValue T) T {
	if r.err == nil {
		return r.value
	}
	return defaultValue
}

// UnwrapErr 获取错误（如果成功则panic）
func (r Result[T]) UnwrapErr() error {
	if r.err == nil {
		panic("called UnwrapErr on Ok value")
	}
	return r.err
}

// Map 映射Result值
func (r Result[T]) Map(mapper func(T) T) Result[T] {
	if r.err == nil {
		return Ok(mapper(r.value))
	}
	return Err[T](r.err)
}

// MapErr 映射Result错误
func (r Result[T]) MapErr(mapper func(error) error) Result[T] {
	if r.err != nil {
		return Err[T](mapper(r.err))
	}
	return r
}

// AndThen 链式操作
func (r Result[T]) AndThen(mapper func(T) Result[T]) Result[T] {
	if r.err == nil {
		return mapper(r.value)
	}
	return Err[T](r.err)
}