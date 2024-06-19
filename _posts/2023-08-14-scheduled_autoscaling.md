---
layout: base
title: "Scheduled Scaling with Autoscaling Groups"
categories: devops aws
---

# Scheduled Scaling with Autoscaling Groups

Sometimes we want to scale up and scale down the desired capacity of an autoscaling group based on a schedule.

For example:

* Work hours - evenings and weekends are not busy
* Business reasons - tax season, gift-giving season, etc.

To do this, Amazon offers [scheduled scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-scheduled-scaling.html)

Terraform supports creating scaling schedules using the `aws_autoscaling_schedule` resource.

## Example

Here are some things learned from using `aws_autoscaling_schedule`:

* If you don't set a `start_time`, the schedule will run immediately and then follow the schedule after that. Its a good idea to set the start time to the recurrence.
* You'll want to ignore the changes to `start_time` otherwise terraform will want to update the resource with each `terraform apply`.
* Setting `min_size`, `max_size` or `desired_capacity` to -1 leaves the setting unchanged.

Scheduled Scale Down

```terraform
resource "aws_autoscaling_schedule" "scheduled_scale_down" {
  scheduled_action_name  = "my-cluster-scale-down"
  min_size               = 1
  max_size               = -1
  desired_capacity       = 1
  start_time             = "${local.upcoming_friday}T23:59:00Z"
  recurrence             = "59 23 * * FRI"
  time_zone              = "US/Pacific"
  autoscaling_group_name = aws_autoscaling_group.my_cluster.name
  lifecycle {
    ignore_changes = [start_time]
  }
}
```

Scheduled Scale Up

```terraform
resource "aws_autoscaling_schedule" "scheduled_scale_up" {
  scheduled_action_name  = "my-cluster-scale-down"
  min_size               = local.my_cluster_member.min_size
  max_size               = local.my_cluster_member.max_size
  desired_capacity       = local.my_cluster_member.desired_capacity
  start_time             = "${local.upcoming_monday}T03:00:00Z"
  recurrence             = "00 03 * * MON"
  time_zone              = "US/Pacific"
  autoscaling_group_name = aws_autoscaling_group.my_cluster.name
  lifecycle {
    ignore_changes = [start_time]
  }
}
```