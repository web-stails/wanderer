<?php

namespace App\Models\Lk;

use App\Notifications\ResetPassword;
use App\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * App\Models\Lk\User
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $phone
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $notifications
 * @property-read int|null $notifications_count
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static bool|null forceDelete()
 * @method static \Illuminate\Database\Query\Builder|\App\Models\Lk\User onlyTrashed()
 * @method static bool|null restore()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereDeletedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Models\Lk\User withTrashed()
 * @method static \Illuminate\Database\Query\Builder|\App\Models\Lk\User withoutTrashed()
 * @property string $surname
 * @property int $active
 * @property string|null $last_active
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereLastActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereSurname($value)
 * @property-read string $full_name
 * @property string|null $carousel_uid
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User whereCarouselUid($value)
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Lk\Children[] $children
 * @property-read int|null $children_count
 * @property-read \Illuminate\Database\Eloquent\Collection $groups
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Lk\Purchase[] $purchases
 * @property-read int|null $purchases_count
 * @property string $photo
 * @property-read \Illuminate\Database\Eloquent\Collection $children_groups
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Lk\User wherePhoto($value)
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;
    use SoftDeletes;
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];

    protected $table = 'user';

    protected $guard = 'lk';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['_option', 'fio', 'name', 'surname', 'active', 'email', 'phone', 'password', 'photo'];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Возвращает полное имя по full_name
     * @return string
     */
    public function getFullNameAttribute()
    {
        return collect([$this->name, $this->surname])->join(' ');
    }

    /**
     * Переопределение отправки письма поддтверждения почты
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmail());
    }

    /**
     * Переопределение ссылки для сброса пароля
     * @param string $token
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPassword($token));
    }

    /**
     * Дети у которого пользователь сопровождающий
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function children()
    {
        return $this->hasMany(Children::class, 'parent_id');
    }

    /**
     * Операции
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
    public function purchases() {
        return $this->hasManyThrough(Purchase::class, Children::class, 'parent_id');
    }

    /**
     * Дети группированные по уникальности
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getChildrenGroupsAttribute()
    {
        return $this->children->groupBy(function($item) {
            return $item->first_name.'-'. $item->birthday->format('U');
        });
    }

}
